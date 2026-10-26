import { safeMediaUrl } from './instagram-source.js';
const ACCOUNT='magiskas.miskas';
// Secrets stay on the server. Pagination is reconstructed against one pinned host;
// a response cannot redirect the credential to a different URL.
export async function readInstagramApi(accessToken,request=fetch) {
  if(!accessToken)throw new Error('Instagram API is not connected');
  const get=async(path,params)=>{
    const url=new URL(`https://graph.instagram.com/v26.0/${path}`);
    for(const [key,value] of Object.entries(params))url.searchParams.set(key,value);
    const response=await request(url,{headers:{Authorization:`Bearer ${accessToken}`},redirect:'error',signal:AbortSignal.timeout(20000)});
    const payload=await response.json();
    if(!response.ok||payload.error)throw Object.assign(new Error('Instagram API request failed'),{
      instagramStatus:response.status,
      instagramCode:Number.isInteger(payload.error?.code)?payload.error.code:undefined,
      instagramSubcode:Number.isInteger(payload.error?.error_subcode)?payload.error.error_subcode:undefined,
    });
    return payload;
  };
  const result=await get('me',{fields:'user_id,username'}),account=result.data?.[0]||result;
  if(account.username!==ACCOUNT||!/^\d+$/.test(String(account.user_id)))throw new Error('Unexpected Instagram account');
  const posts=[],ids=new Set(),cursors=new Set();let after='';
  for(let page=0;page<100;page++) {
    const data=await get(`${account.user_id}/media`,{fields:'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',limit:'100',...(after?{after}:{})});
    if(!Array.isArray(data.data))throw new Error('Invalid Instagram media response');
    for(const item of data.data) {
      if(!/^\d+$/.test(item.id)||!Number.isFinite(Date.parse(item.timestamp))||!['IMAGE','VIDEO','CAROUSEL_ALBUM'].includes(item.media_type))throw new Error('Invalid Instagram media');
      let permalink;try{permalink=new URL(item.permalink)}catch{throw new Error('Invalid Instagram permalink')}
      if(permalink.protocol!=='https:'||!['www.instagram.com','instagram.com'].includes(permalink.hostname)||permalink.username||permalink.password)throw new Error('Invalid Instagram permalink');
      const image=safeMediaUrl(item.media_type==='VIDEO'?item.thumbnail_url:item.media_url);
      const video=item.media_type==='VIDEO'?safeMediaUrl(item.media_url):'';
      if(!image)throw new Error('Invalid Instagram poster');
      if(!ids.has(item.id)){ids.add(item.id);posts.push({id:item.id,permalink:permalink.href,timestamp:item.timestamp,caption:String(item.caption||'').slice(0,500),media_type:item.media_type==='VIDEO'?'VIDEO':'IMAGE',source:image,...(video?{videoSource:video}:{})});}
    }
    if(!data.paging?.next)return posts.sort((a,b)=>Date.parse(b.timestamp)-Date.parse(a.timestamp));
    after=data.paging.cursors?.after;
    if(typeof after!=='string'||!after||cursors.has(after))throw new Error('Invalid Instagram pagination');
    cursors.add(after);
  }
  throw new Error('Instagram archive pagination did not complete');
}
