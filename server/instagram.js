import { readFile,writeFile,mkdir,rename,stat } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { parsePublicProfile,safeMediaUrl,parseEmbedVideo } from './instagram-source.js';
import { readInstagramApi } from './instagram-api.js';
export const mediaDirectory=process.env.MM_MEDIA_DIR||join(homedir(),'mm-data','instagram');
const feedPath=join(mediaDirectory,'feed.json');
export async function readGallery(){return JSON.parse(await readFile(feedPath,'utf8'));}
async function download(url,max=5*1024*1024){
  const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(20000),headers:{'User-Agent':'Mozilla/5.0 (compatible; MagiskasMiskasGallery/1.0)','Accept-Language':'en'}});
  if(!response.ok)throw new Error(`Instagram HTTP ${response.status}`);
  let length=0;const chunks=[];
  for await(const chunk of response.body){length+=chunk.length;if(length>max)throw new Error('Media too large');chunks.push(chunk);}
  return Buffer.concat(chunks);
}
async function store(id,bytes,extension){
  const hash=createHash('sha256').update(bytes).digest('hex').slice(0,12);const name=`${id}-${hash}.${extension}`;
  await writeFile(join(mediaDirectory,name),bytes,{flag:'wx'}).catch(error=>{if(error.code!=='EEXIST')throw error;});return `instagram/${name}`;
}
let refreshing=false;
export async function refreshGallery(){
  if(refreshing)return;refreshing=true;
  try{
    await mkdir(mediaDirectory,{recursive:true});
    const old=await readGallery().catch(()=>({feed:{posts:[]}}));
    // Once connected, never silently replace the complete archive with six public previews.
    const source=process.env.INSTAGRAM_ACCESS_TOKEN?await readInstagramApi(process.env.INSTAGRAM_ACCESS_TOKEN):parsePublicProfile((await download('https://www.instagram.com/magiskas.miskas/embed/')).toString('utf8'));
    const posts=[];
    for(const item of source){
      const {source:imageSource,videoSource:apiVideo,...metadata}=item;
      const previous=old.feed.posts.find(post=>post.id===item.id);
      const filename=previous?.media_url?.match(/^instagram\/(\d+-[a-f0-9]{12}\.jpg)$/)?.[1];
      if(filename && (!apiVideo||previous.video_url) && await stat(join(mediaDirectory,filename)).then(()=>true,()=>false)){posts.push({...previous,...metadata});continue;}
      const url=safeMediaUrl(imageSource);if(!url)throw new Error('Invalid image host');
      const bytes=await download(url);if(bytes[0]!==255||bytes[1]!==216)throw new Error('Invalid JPEG');
      const image=await store(item.id,bytes,'jpg');let video='';
      if(item.media_type==='VIDEO')try{
        const videoSource=apiVideo||parseEmbedVideo((await download(item.permalink+'embed/')).toString('utf8'),new URL(item.permalink).pathname.split('/')[2]);
        if(videoSource){const mp4=await download(videoSource,40*1024*1024);if(mp4.subarray(4,8).toString()!=='ftyp')throw new Error('Invalid MP4');video=await store(item.id,mp4,'mp4');}
      }catch{/* The current poster remains usable if Instagram does not supply a video. */}
      posts.push({...metadata,media_url:image,thumbnail_url:image,...(video?{video_url:video}:{})});
    }
    // Atomic membership replacement removes deleted posts. Invalid/partial responses never replace the feed.
    const next={feed:{account:'magiskas.miskas',posts},checked_at:new Date().toISOString()};
    await writeFile(feedPath+'.tmp',JSON.stringify(next));await rename(feedPath+'.tmp',feedPath);
  }finally{refreshing=false;}
}
