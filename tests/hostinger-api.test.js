import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createApi } from '../server/api.js';
import { token,digest,equalToken,sessionCookie } from '../server/security.js';
const origin='https://www.magiskasmiskas.lt';
async function call(path,method='GET',payload,headers={},execute=async()=>[[]]) {
  const req=Readable.from(payload?[Buffer.from(JSON.stringify(payload))]:[]);req.url=path;req.method=method;req.headers={origin,'content-type':'application/json',...headers};req.socket={remoteAddress:'127.0.0.1'};
  let status,result;const res={writeHead(s){status=s;},setHeader(){},end(s){result=JSON.parse(s);}};
  await createApi({db:{execute},origin,sendLogin:async()=>{throw new Error('Should not send')}})(req,res);
  return {status,result};
}
test('login tokens have 256 bits and only digests are used as identifiers',()=>{
  const a=token(),b=token();assert.equal(a.length,64);assert.notEqual(a,b);assert.notEqual(digest(a),a);assert.equal(equalToken(a,a),true);assert.equal(equalToken(a,b),false);assert.match(sessionCookie(a),/HttpOnly; SameSite=Strict; Max-Age=43200; Secure/);
});
test('cross-origin publishing is rejected before touching the database',async()=>{
  const r=await call('/api/content','PUT',{}, {origin:'https://evil.invalid'},()=>{throw new Error('Must not query')});assert.equal(r.status,403);
});
test('anonymous visitors cannot publish or access editor operations',async()=>{
  assert.equal((await call('/api/content','PUT',{})).status,401);
});
test('an authenticated cookie alone cannot publish without CSRF',async()=>{
  const cookie=token(),csrf=token();const r=await call('/api/content','PUT',{}, {cookie:`__Host-mm_session=${cookie}`},async()=>[[{email:'editor@example.test',user_id:'u1',csrf}]]);assert.equal(r.status,403);
});
test('empty migration never exposes old placeholder content as imported content',async()=>{
  const r=await call('/api/content');assert.equal(r.status,503);
});
