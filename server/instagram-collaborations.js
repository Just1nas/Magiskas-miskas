import { safeMediaUrl } from './instagram-source.js';

// These are explicitly selected public collaborations visible on our profile.
// No Instagram session cookies or API credentials are sent to public embeds.
export function collaborationReference(entry) {
  const url=new URL(entry.permalink);
  const match=url.pathname.match(/^\/([\w.]+)\/(p|reel)\/([\w-]+)\/$/);
  if(url.origin!=='https://www.instagram.com'||url.search||url.hash||!match||!Number.isFinite(Date.parse(entry.timestamp)))throw new Error('Invalid collaboration reference');
  return {owner:match[1],kind:match[2],shortcode:match[3],permalink:url.href,timestamp:entry.timestamp};
}

export function parseCollaboration(html,entry) {
  const ref=collaborationReference(entry);
  const match=html.match(/"contextJSON"\s*:\s*("(?:[^"\\]|\\.)*")/);
  if(!match)throw new Error('Instagram collaboration is temporarily unavailable');
  const data=JSON.parse(JSON.parse(match[1]));
  if(data.context?.shortcode!==ref.shortcode)throw new Error('Unexpected collaboration');
  const post=data.gql_data?.shortcode_media;
  if(post===null)return null;
  if(!post||post.shortcode!==ref.shortcode||post.owner?.username!==ref.owner||!/^\d+$/.test(post.id))throw new Error('Unexpected collaboration author');
  const source=safeMediaUrl(post.display_url);
  if(!source)throw new Error('Invalid collaboration image');
  // Instagram still provides a public poster for some non-embeddable Reels.
  // Keep that preview and its original link, but never download their video.
  const previewOnly=Boolean(data.context.copyright_blocked);
  const video=post.is_video&&!previewOnly?safeMediaUrl(post.video_url):'';
  return {id:post.id,permalink:ref.permalink,timestamp:ref.timestamp,owner:ref.owner,
    caption:String(post.edge_media_to_caption?.edges?.[0]?.node?.text||'').replace(/\\n/g,'\n').slice(0,500),
    media_type:post.is_video?'VIDEO':'IMAGE',source,...(previewOnly?{preview_only:true}:{}),...(video?{videoSource:video}:{})};
}

export async function readCollaborations(entries,previous=[],request=fetch) {
  const posts=[];
  for(const entry of entries) {
    const ref=collaborationReference(entry);
    try {
      const response=await request(`https://www.instagram.com/${ref.kind}/${ref.shortcode}/embed/`,{
        headers:{'User-Agent':'Mozilla/5.0 (compatible; MagiskasMiskasGallery/1.0)','Accept-Language':'en'},
        redirect:'error',signal:AbortSignal.timeout(15000),
      });
      // Explicit removal is authoritative; a rate limit or login page is not.
      if([404,410].includes(response.status))continue;
      if(!response.ok)throw new Error('Instagram collaboration request failed');
      const html=await response.text();if(html.length>4*1024*1024)throw new Error('Collaboration response too large');
      const post=parseCollaboration(html,entry);if(post)posts.push(post);
    }catch {
      const cached=previous.find(post=>post.permalink===ref.permalink);
      if(cached)posts.push({...cached,owner:ref.owner});
    }
  }
  return posts;
}

export function mergeInstagramPosts(primary,collaborations) {
  const ids=new Set(),codes=new Set();
  return [...primary,...collaborations].filter(post=>{
    const code=new URL(post.permalink).pathname.split('/').filter(Boolean).at(-1);
    if(ids.has(post.id)||codes.has(code))return false;
    ids.add(post.id);codes.add(code);return true;
  }).sort((a,b)=>Date.parse(b.timestamp)-Date.parse(a.timestamp));
}
