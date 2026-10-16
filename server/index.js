import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import nodemailer from 'nodemailer';
import { bootstrapImport } from './bootstrap-import.js';
import { connectDatabase, schema } from './database.js';
import { backupContent,readContentBackup } from './backups.js';
import { readGallery,refreshGallery,mediaDirectory } from './instagram.js';
import { createApi } from './api.js';
async function start(){
const db=connectDatabase();await schema(db).catch(()=>console.warn('Database unavailable; serving last published content where available.'));
await bootstrapImport(db).catch(()=>console.warn('Initial data import needs attention; existing data was not overwritten.'));
const origin=new URL(process.env.SITE_ORIGIN||'https://www.magiskasmiskas.lt').origin;
const mail=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||465),secure:process.env.SMTP_PORT!=='587',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}});
const api=createApi({db,origin,readGallery,backupContent,readContentBackup,sendLogin:async(to,url)=>{
  if(!process.env.SMTP_HOST||!process.env.SMTP_PASSWORD||!process.env.SMTP_FROM)throw new Error('SMTP not configured');
  await mail.sendMail({from:process.env.SMTP_FROM,to,subject:'Magiškas Miškas · prisijungimas',text:`Prisijunk prie redagavimo skydelio:\n${url}\n\nNuoroda galioja 15 minučių ir tik vieną kartą. Jei jos neprašei, laišką ignoruok.`});
}});
const root=await realpath(resolve(import.meta.dirname,'../dist'));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.mp4':'video/mp4','.pdf':'application/pdf','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{
  if(req.url.startsWith('/api/'))return api(req,res);
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
server.listen(Number(process.env.PORT||3000),'0.0.0.0');
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>db.end().finally(()=>process.exit(0))));

}
start().catch(error=>{console.error(error);process.exitCode=1;});
