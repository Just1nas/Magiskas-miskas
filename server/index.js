import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { bootstrapImport } from './bootstrap-import.js';
import { connectDatabase, schema } from './database.js';
import { backupContent,readContentBackup } from './backups.js';
import { readGallery,refreshGallery,mediaDirectory } from './instagram.js';
import { createApi } from './api.js';
import { provisionPasswordSetup } from './setup-passwords.js';
import { migrateConfirmedEnglish } from './confirmed-english.js';
import { createTicketSchedule } from './ticket-schedule.js';
import ticketEvents from '../src/ticket-events.json' with {type:'json'};
function start(){
const db=connectDatabase();
const ready=schema(db).then(()=>bootstrapImport(db)).then(()=>migrateConfirmedEnglish(db,backupContent)).then(()=>provisionPasswordSetup(db)).catch(error=>console.warn('CMS initialization failed:',error.code||error.name));
const origin=new URL(process.env.SITE_ORIGIN||'https://www.magiskasmiskas.lt').origin;
const schedule=createTicketSchedule({initial:ticketEvents});
const api=createApi({db,origin,readGallery,readTicketEvents:schedule.read,backupContent,readContentBackup});
const root=resolve(import.meta.dirname,'../dist');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.mp4':'video/mp4','.pdf':'application/pdf','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{
  if(req.url.startsWith('/api/')){await ready;return api(req,res);}
  try {
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
    let path=decodeURIComponent(new URL(req.url,origin).pathname);
    if(path.split('/').some(part=>part.startsWith('.')))throw new Error('Hidden path');
    if(path.endsWith('/'))path+='index.html';
    const mediaMatch=path.match(/^\/instagram\/(\d+-[a-f0-9]{12}\.(?:jpg|mp4))$/);
    const allowedRoot=mediaMatch?await realpath(mediaDirectory):root;
    let file=mediaMatch?resolve(allowedRoot,mediaMatch[1]):resolve(root,'.'+path);
    if(!file.startsWith(allowedRoot+sep))throw new Error('Invalid path');
    let info=await stat(file);if(info.isDirectory()){file=resolve(file,'index.html');info=await stat(file);}
    const actual=await realpath(file);if(!actual.startsWith(allowedRoot+sep))throw new Error('Invalid file');
    const ext=file.slice(file.lastIndexOf('.'));
    res.setHeader('Content-Type',mime[ext]||'application/octet-stream');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
    res.setHeader('Cache-Control',ext==='.html'?'no-cache':path.startsWith('/assets/')?'public,max-age=31536000,immutable':'public,max-age=3600');
    let start=0,end=info.size-1;
    if(req.headers.range){
      const m=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
      if(!m||Number(m[1])>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end();}
      start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),end):end;
      if(end<start){res.writeHead(416);return res.end();}
      res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${info.size}`);
    }
    res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Length',end-start+1);
    if(req.method==='HEAD')return res.end();
    createReadStream(actual,{start,end}).on('error',()=>res.destroy()).pipe(res);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Puslapis nerastas.');}
});
server.requestTimeout=30000;server.headersTimeout=15000;
const refresh=()=>refreshGallery().catch(()=>console.warn('Instagram refresh unavailable; retained last verified feed.'));
refresh();const galleryTimer=setInterval(refresh,300000);galleryTimer.unref();
schedule.refresh();const ticketTimer=setInterval(schedule.refresh,300000);ticketTimer.unref();
server.listen(Number(process.env.PORT||3000),'0.0.0.0');
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>db.end().finally(()=>process.exit(0))));

}
start();
