import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCollaboration,readCollaborations,mergeInstagramPosts} from '../server/instagram-collaborations.js';
const entry={permalink:'https://www.instagram.com/author/reel/collab/',timestamp:'2026-10-10T12:00:00Z'};
const post={id:'123',shortcode:'collab',owner:{username:'author'},is_video:true,display_url:'https://x.cdninstagram.com/post.jpg',video_url:'https://x.cdninstagram.com/video.mp4',edge_media_to_caption:{edges:[{node:{text:'Tikras įrašas'}}]}};
const html=(media=post,context={shortcode:'collab'})=>JSON.stringify({contextJSON:JSON.stringify({context,gql_data:{shortcode_media:media}})});
test('public collaborations verify selected shortcode, original author and CDN URLs',()=>{
 const parsed=parseCollaboration(html(),entry);assert.equal(parsed.owner,'author');assert.equal(parsed.timestamp,entry.timestamp);assert.equal(parsed.videoSource,post.video_url);
 for(const media of [{...post,owner:{username:'other'}},{...post,shortcode:'wrong'},{...post,display_url:'https://evil.test/image.jpg'}])assert.throws(()=>parseCollaboration(html(media),entry));
 assert.throws(()=>parseCollaboration('<html>Login</html>',entry));
 assert.equal(parseCollaboration(html(null),entry),null);
 const preview=parseCollaboration(html(post,{shortcode:'collab',copyright_blocked:true}),entry);
 assert.equal(preview.preview_only,true);assert.equal(preview.videoSource,undefined);assert.equal(preview.source,post.display_url);
});
test('transient errors preserve only the selected cached post; confirmed deletion removes it',async()=>{
 const cached={id:'123',permalink:entry.permalink,timestamp:entry.timestamp,media_url:'instagram/123-0123456789ab.jpg'};
 const read=(status,body='')=>readCollaborations([entry],[cached],async(url,options)=>{
  assert.equal(url,'https://www.instagram.com/reel/collab/embed/');assert.equal(options.headers.Authorization,undefined);assert.equal(options.redirect,'error');
  return {status,ok:status===200,text:async()=>body};
 });
 assert.equal((await read(429))[0].media_url,cached.media_url);
 assert.equal((await read(200,'Login required')).length,1);
 assert.equal((await read(200,html())).length,1);
 assert.deepEqual(await read(404),[]);assert.deepEqual(await read(410),[]);assert.deepEqual(await read(200,html(null)),[]);
 await assert.rejects(()=>readCollaborations([{...entry,permalink:'https://evil.test/author/reel/collab/'}]));
});
test('all 19 distinct posts survive while duplicate IDs or permalinks never repeat',()=>{
 const own=Array.from({length:10},(_,i)=>({id:String(i),permalink:`https://www.instagram.com/p/own${i}/`,timestamp:entry.timestamp}));
 const extra=Array.from({length:9},(_,i)=>({id:String(i+10),permalink:`https://www.instagram.com/author/p/shared${i}/`,timestamp:entry.timestamp}));
 const merged=mergeInstagramPosts(own,[...extra,own[0],{...extra[0],id:'999',permalink:'https://www.instagram.com/p/shared0/'}]);
 assert.equal(merged.length,19);assert.equal(new Set(merged.map(p=>p.id)).size,19);
});
