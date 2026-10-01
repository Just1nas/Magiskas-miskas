// Fixed-account, server-side refresh. No caller-supplied URLs or credentials.
import { createClient } from 'npm:@supabase/supabase-js@2.117.2';
const ACCOUNT='magiskas.miskas';
const db=createClient(Deno.env.get('SUPABASE_URL'),Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false}});
export function parsePublicProfile(html) {
  // Read the public embed's JSON as data; never execute remote JavaScript.
  const match = html.match(/"contextJSON"\s*:\s*("(?:[^"\\]|\\.)*")/);
  if (!match) throw new Error('Instagram public profile data is unavailable; keeping the previous gallery.');
  const context = JSON.parse(JSON.parse(match[1])).context;
  if (context?.username !== ACCOUNT || !Array.isArray(context.graphql_media)) throw new Error('Unexpected Instagram profile.');
  const seen = new Set();
  const posts = context.graphql_media.map(item => item?.shortcode_media).filter(post => {
    if (!post || !/^\d+$/.test(post.id) || !/^[\w-]+$/.test(post.shortcode) || post.owner?.username !== ACCOUNT || !Number.isFinite(post.taken_at_timestamp) || seen.has(post.id)) return false;
    seen.add(post.id); return true;
  }).sort((a,b) => b.taken_at_timestamp - a.taken_at_timestamp).slice(0,5);
  // Never replace a working feed with a login page, challenge or partial empty response.
  if (!posts.length && context.graphql_media.length) throw new Error('Invalid media response');
  return posts.map(post => ({
    id: post.id,
    permalink: `https://www.instagram.com/${post.is_video ? 'reel' : 'p'}/${post.shortcode}/`,
    timestamp: new Date(post.taken_at_timestamp * 1000).toISOString(),
    caption: String(post.edge_media_to_caption?.edges?.[0]?.node?.text || '').replace(/\\n/g, '\n').slice(0,500),
    media_type: post.is_video ? 'VIDEO' : 'IMAGE',
    source: post.display_url,
  }));
}
export function safeMediaUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && (url.hostname.endsWith('.cdninstagram.com') || url.hostname.endsWith('.fbcdn.net')) ? url.href : '';
  } catch { return ''; }
}
export function parseEmbedVideo(html, shortcode) {
  // Decode JSON string literals only; never evaluate the embedded scripts.
  const find = (value, depth = 0) => {
    if (!value || typeof value !== 'object' || depth > 25) return '';
    if (value.shortcode === shortcode && value.is_video && safeMediaUrl(value.video_url)) return safeMediaUrl(value.video_url);
    for (const child of Object.values(value)) { const url = find(child, depth + 1); if (url) return url; }
    return '';
  };
  for (const token of html.match(/"(?:[^"\\]|\\.)*"/g) || []) {
    if (!token.includes('video_url')) continue;
    try { const url = find(JSON.parse(JSON.parse(token))); if (url) return url; } catch {}
  }
  return '';
}

async function download(url,maxBytes=5*1024*1024){
 const r=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(18000),headers:{'User-Agent':'Mozilla/5.0 (compatible; MagiskasMiskasGallery/1.0)','Accept-Language':'en'}});
 if(!r.ok)throw Error('Instagram HTTP '+r.status);
 const reader=r.body.getReader(), chunks=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>maxBytes){await reader.cancel();throw Error('Media too large')}chunks.push(value)}
 const bytes=new Uint8Array(size);let at=0;for(const c of chunks){bytes.set(c,at);at+=c.length}return bytes;
}
async function saveAsset(id,bytes,extension,type){
 const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
 const hash=[...digest].map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,12);
 const name=`${id}-${hash}.${extension}`;
 const {error}=await db.storage.from('instagram-media').upload(name,bytes,{contentType:type,upsert:true,cacheControl:'31536000'});if(error)throw error;
 return db.storage.from('instagram-media').getPublicUrl(name).data.publicUrl;
}
Deno.serve(async req=>{
 if(req.method!=='POST')return Response.json({error:'POST required'},{status:405});
 const {data:old,error:readError}=await db.from('instagram_cache').select('*').eq('id',1).single();
 if(readError)return Response.json({error:'Cache unavailable'},{status:503});
 // Atomic lease prevents overlap and public callers from forcing repeated downloads.
 const cutoff=new Date(Date.now()-240000).toISOString();
 const {data:lease,error:leaseError}=await db.from('instagram_cache').update({last_attempt:new Date().toISOString()}).eq('id',1).lt('last_attempt',cutoff).select('id');
 if(leaseError)return Response.json({error:'Lease unavailable'},{status:503});
 if(!lease?.length)return Response.json({status:'already_checked',checked_at:old.checked_at});
 try{
  const text=new TextDecoder().decode(await download(`https://www.instagram.com/${ACCOUNT}/embed/`));
  const source=parsePublicProfile(text), posts=[];
  for(const item of source){
   const {source:imageSource,...metadata}=item;
   const previous=old.feed.posts.find(p=>p.id===item.id);
   // Immutable media is reused; current captions and membership always come from Instagram.
   if(previous?.media_url){posts.push({...previous,...metadata});continue;}
   const url=safeMediaUrl(imageSource);if(!url)throw Error('Invalid poster host');
   const bytes=await download(url);if(bytes[0]!==255||bytes[1]!==216)throw Error('Invalid JPEG');
   const poster=await saveAsset(item.id,bytes,'jpg','image/jpeg');let video_url='';
   if(item.media_type==='VIDEO')try{
    const embed=new TextDecoder().decode(await download(item.permalink+'embed/'));
    const videoSource=parseEmbedVideo(embed,new URL(item.permalink).pathname.split('/')[2]);
    if(videoSource){const video=await download(videoSource,40*1024*1024);if(new TextDecoder().decode(video.slice(4,8))!=='ftyp')throw Error('Invalid MP4');video_url=await saveAsset(item.id,video,'mp4','video/mp4');}
   }catch{console.warn('Video unavailable; poster retained for '+item.id)}
   posts.push({...metadata,media_url:poster,thumbnail_url:poster,...(video_url?{video_url}:{})});
  }
  const checked_at=new Date().toISOString();
  const {error}=await db.from('instagram_cache').update({feed:{account:ACCOUNT,posts},checked_at,last_error:null}).eq('id',1);if(error)throw error;
  return Response.json({status:'updated',posts:posts.length,checked_at});
 }catch(error){
  const message=String(error.message||'Refresh failed').slice(0,400);
  await db.from('instagram_cache').update({last_error:message}).eq('id',1);
  return Response.json({status:'failed',error:message,previous_checked_at:old.checked_at},{status:502});
 }
});
