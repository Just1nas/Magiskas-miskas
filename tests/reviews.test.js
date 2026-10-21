import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {createApi} from '../server/api.js';
import {validateReview} from '../server/reviews.js';
import {containsReviewProfanity} from '../server/review-language.js';
import {token,digest} from '../server/security.js';
const origin='https://www.magiskasmiskas.lt', visitor=token(), csrf=token(),session=token();
function fixture(){
 const forms=new Map(),rows=new Map();let next=1,age=5,blocked=false;
 async function execute(sql,p=[]){
  if(sql.startsWith('INSERT INTO mm_rates'))return [{affectedRows:1}];
  if(sql.startsWith('SELECT hits'))return [[{hits:blocked?10000:1}]];
  if(sql.startsWith('DELETE FROM mm_review_forms'))return [{}];
  if(sql.startsWith('INSERT INTO mm_review_forms')){forms.set(p[0],{visitor_hash:p[1],review_id:null,age,valid:1});return [{}];}
  if(sql.includes('FROM mm_review_forms WHERE token_hash'))return [[...(forms.has(p[0])?[{...forms.get(p[0]),age}]:[])]];
  if(sql.startsWith('UPDATE mm_review_forms')){forms.get(p[1]).review_id=p[0];return [{}];}
  if(sql.startsWith('INSERT INTO mm_reviews')){let id=next++;rows.set(String(id),{id,display_name:p[0],review_text:p[1],visitor_hash:p[2],content_hash:p[3],status:'published',created_at:new Date('2026-10-21T12:00:00Z')});return [{insertId:id}];}
  if(sql.startsWith('SELECT * FROM mm_reviews WHERE visitor_hash'))return [[...rows.values()].filter(r=>r.visitor_hash===p[0]&&r.content_hash===p[1]&&r.status==='published').slice(0,1)];
  if(sql.startsWith('SELECT * FROM mm_reviews WHERE id'))return [[...rows.values()].filter(r=>String(r.id)===String(p[0])&&(!sql.includes("status='published'")||r.status==='published'))];
  if(sql.startsWith('SELECT COUNT(*)'))return [[{total:[...rows.values()].filter(r=>r.status==='published').length}]];
  if(sql.startsWith('SELECT id,display_name,review_text,created_at,visitor_hash'))return [[...rows.values()].filter(r=>r.status==='published'&&(!p.length||r.id<Number(p[0]))).reverse().slice(0,Number(sql.match(/LIMIT (\d+)/)[1]))];
  if(sql.startsWith('SELECT id,display_name,review_text,created_at,status'))return [[...rows.values()].reverse()];
  if(sql.startsWith("UPDATE mm_reviews SET status='withdrawn'")){const r=rows.get(p[0]);if(r&&r.visitor_hash===p[1]&&r.status==='published')r.status='withdrawn';return [{}];}
  if(sql.startsWith('UPDATE mm_reviews SET status=?')){const r=rows.get(p[2]);if(r&&r.status!=='withdrawn')r.status=p[0];return [{}];}
  if(sql.includes('FROM mm_sessions'))return [[{email:'editor@example.test',user_id:'editor',csrf}]];
  throw new Error('Unexpected query: '+sql);
 }
 const conn={execute,beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release(){}};
 const db={execute,getConnection:async()=>conn};const api=createApi({db,origin});
 async function call(path,method='GET',input,headers={}){
  const req=Readable.from(input===undefined?[]:[Buffer.from(JSON.stringify(input))]);req.url=path;req.method=method;req.socket={remoteAddress:'127.0.0.1'};req.headers={origin,'content-type':'application/json',cookie:'__Host-mm_review_visitor='+visitor,...headers};
  const result={headers:{}};const res={setHeader(k,v){result.headers[k]=v},writeHead(status){result.status=status},end(text){result.body=JSON.parse(text)}};await api(req,res);return result;
 }
 return {call,rows,setAge:n=>age=n,setBlocked:b=>blocked=b};
}
const input=raw=>({name:'Lankytojas',text:'Tai aiškiai pažymėta sistemos patikra.',token:raw,website:''});
test('public review becomes visible immediately, without credentials or private metadata; retry is idempotent',async()=>{
 const f=fixture();const form=await f.call('/api/reviews/form');assert.equal(form.status,200);
 const first=await f.call('/api/reviews','POST',input(form.body.token));assert.equal(first.status,201);assert.equal(first.body.review.mine,true);
 const retry=await f.call('/api/reviews','POST',input(form.body.token));assert.equal(retry.body.review.id,first.body.review.id);assert.equal(f.rows.size,1);
 const page=await f.call('/api/reviews');assert.equal(page.body.total,1);assert.equal(page.body.reviews[0].text,input().text);assert.equal('visitor_hash' in page.body.reviews[0],false);
});
test('cross-origin, bot fields, invalid tokens, rushed forms and rate limits cannot publish',async()=>{
 const f=fixture();const form=await f.call('/api/reviews/form');const raw=form.body.token;
 assert.equal((await f.call('/api/reviews','POST',input(raw),{origin:'https://evil.test'})).status,403);
 assert.equal((await f.call('/api/reviews','POST',{...input(raw),website:'spam'})).status,400);
 assert.equal((await f.call('/api/reviews','POST',input('a'.repeat(64)))).status,410);
 f.setAge(0);assert.equal((await f.call('/api/reviews','POST',input(raw))).status,429);
 f.setAge(5);f.setBlocked(true);assert.equal((await f.call('/api/reviews','POST',input(raw))).status,429);assert.equal(f.rows.size,0);
});
test('only author can withdraw; editor moderation requires session AND CSRF and cannot restore author withdrawals',async()=>{
 const f=fixture();const form=await f.call('/api/reviews/form');const posted=await f.call('/api/reviews','POST',input(form.body.token));const id=posted.body.review.id;
 const path='/api/admin/reviews/'+id+'/visibility';assert.equal((await f.call(path,'POST',{visible:false})).status,401);
 assert.equal((await f.call(path,'POST',{visible:false},{cookie:'__Host-mm_session='+session})).status,403);
 const auth={cookie:'__Host-mm_session='+session,'x-csrf-token':csrf};
 assert.equal((await f.call(path,'POST',{visible:false},auth)).status,200);assert.equal((await f.call('/api/reviews')).body.total,0);
 await f.call(path,'POST',{visible:true},auth);assert.equal((await f.call('/api/reviews')).body.total,1);
 await f.call('/api/reviews/'+id+'/withdraw','POST',{}, {cookie:'__Host-mm_review_visitor='+token()});assert.equal((await f.call('/api/reviews')).body.total,1);
 await f.call('/api/reviews/'+id+'/withdraw','POST',{});assert.equal((await f.call('/api/reviews')).body.total,0);
 await f.call(path,'POST',{visible:true},auth);assert.equal((await f.call('/api/reviews')).body.total,0);
});
test('reviews reject unsafe links and oversized input but retain Lithuanian punctuation and plain text',()=>{
 for(const bad of [{name:'',text:'Puikiai!'},{name:'x',text:'www.spam.lt'},{name:'x',text:'https://spam.test'},{name:'x',text:'x'.repeat(801)}])assert.throws(()=>validateReview(bad));
 assert.deepEqual(validateReview({name:'  Živilė  ',text:'  Labai gražu! „Ačiū“, Miške.  '}),{name:'Živilė',text:'Labai gražu! „Ačiū“, Miške.'});
});
test('profanity is rejected before insertion in either field; a corrected review can use the same form',async()=>{
 const f=fixture();const form=await f.call('/api/reviews/form');
 for(const fields of [{name:'Blet',text:'Nepatiko renginys.'},{name:'Lankytojas',text:'Tai buvo šūdas.'},{name:'Lankytojas',text:'What the f.u.c.k.'}]){
  const rejected=await f.call('/api/reviews','POST',{...input(form.body.token),...fields});
  assert.equal(rejected.status,400);assert.equal(rejected.body.code,'REVIEW_PROFANITY');assert.equal(f.rows.size,0);
 }
 assert.equal((await f.call('/api/reviews')).body.total,0);
 assert.equal((await f.call('/api/reviews','POST',{...input(form.body.token),text:'Man nepatiko: bilietai per brangūs, o eilė ilga.'})).status,201);
});
test('language filter handles common Lithuanian, English and Russian forms and simple masking',()=>{
 for(const word of ['BLET','blėęėt','b.l.e.t','b l e t','b\u200blet','bl3t','kurva','bybis','šūdas','šūdą','šūdinas','pizda','n@hui','fuck','f u c k','f*uck','fuuuck','shitty','bullshit','asshole','блять','сука','хуй','пиздец']){
  assert.equal(containsReviewProfanity('Žodis: '+word+'!'),true,word);
 }
 for(const text of ['Živilė','Benediktas','Dickens','Scunthorpe','Nuostabūs šviesų takai.','Sudėtinga rasti įėjimą.','Šitą spektaklį rekomenduoju.','Sužavėjo ši kūdra ir grybas shiitake.','Nepatiko. Per brangu ir per ilga eilė!','Klasika, pasaka ir fotografija.','Ačiū už vakarą.','The classic lighting was beautiful.']){
  assert.equal(containsReviewProfanity(text),false,text);
 }
});
