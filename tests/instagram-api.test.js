import test from 'node:test';
import assert from 'node:assert/strict';
import {readInstagramApi} from '../server/instagram-api.js';
const media=id=>({id:String(id),timestamp:'2026-10-20T12:00:00Z',media_type:'IMAGE',media_url:'https://scontent.cdninstagram.com/photo.jpg',permalink:`https://www.instagram.com/p/post${id}/`});
test('API failure exposes numeric diagnostics without upstream messages or credentials',async()=>{
 await assert.rejects(()=>readInstagramApi('test-secret',async()=>({ok:false,status:400,json:async()=>({error:{code:190,error_subcode:463,message:'private upstream text test-secret'}})})),error=>{
  assert.equal(error.instagramCode,190);assert.equal(error.instagramSubcode,463);assert.equal(error.instagramStatus,400);
  assert.equal(error.message,'Instagram API request failed');assert.equal(JSON.stringify(error).includes('test-secret'),false);return true;
 });
});
const mock=responses=>async(url,options)=>{
 assert.equal(url.hostname,'graph.instagram.com');assert.equal(options.headers.Authorization,'Bearer test-token');assert.equal(url.searchParams.has('access_token'),false);assert.equal(options.redirect,'error');
 const payload=responses.shift();return {ok:true,json:async()=>payload};
};
test('official source verifies account and follows every page, deduplicating all 18 posts',async()=>{
 const pages=[{user_id:'123',username:'magiskas.miskas'},{data:Array.from({length:10},(_,i)=>media(i)),paging:{next:'https://ignored.example/',cursors:{after:'page-two'}}},{data:Array.from({length:9},(_,i)=>media(i+9))}];
 const posts=await readInstagramApi('test-token',mock(pages));assert.equal(posts.length,18);assert.equal(pages.length,0);
});
test('wrong account, failed page and repeated cursors reject incomplete archives',async()=>{
 await assert.rejects(()=>readInstagramApi('test-token',mock([{user_id:'1',username:'other'}])));
 await assert.rejects(()=>readInstagramApi('test-token',mock([{user_id:'1',username:'magiskas.miskas'},{data:[media(1)],paging:{next:'anything',cursors:{after:'repeat'}}},{data:[media(2)],paging:{next:'anything',cursors:{after:'repeat'}}}])));
 await assert.rejects(()=>readInstagramApi('test-token',async()=>({ok:false})));
});
test('empty authorised archive is valid and unsafe media is rejected',async()=>{
 assert.deepEqual(await readInstagramApi('test-token',mock([{user_id:'1',username:'magiskas.miskas'},{data:[]}])),[]);
 await assert.rejects(()=>readInstagramApi('test-token',mock([{user_id:'1',username:'magiskas.miskas'},{data:[{...media(1),media_url:'https://evil.test/photo.jpg'}]}])));
});
