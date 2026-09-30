import test from 'node:test';
import assert from 'node:assert/strict';
import {editableDefaults,validateEdits,mergeEdits} from '../src/editable-content.js';
import {authFlow} from '../src/admin/auth-flow.js';
test('all fields round trip without changing the published defaults',()=>assert.deepEqual(validateEdits(editableDefaults()),editableDefaults()));
test('old partial documents inherit new fields and retain saved text',()=>{
 const d=mergeEdits({story:'Istorija',instagram:{limit:3}});assert.equal(d.story,'Istorija');assert.equal(d.instagram.limit,3);assert.equal(d.instagram.intervalMs,6500);assert.ok(d.copy.buy);
});
test('unknown and prototype keys rejected at every level',()=>{
 for(const value of ['{"__proto__":{}}','{"constructor":"x"}','{"tickets":{"constructor":"x"}}','{"copy":{"unknown":"x"}}'])assert.throws(()=>validateEdits(JSON.parse(value)));
});
test('URLs reject script schemes, credentials and misleading hosts',()=>{
 for(const url of ['javascript:alert(1)','https://bilietai.lt.evil.test/','https://user:pass@bilietai.lt','http://bilietai.lt'])assert.throws(()=>validateEdits({tickets:{url}}));
 assert.throws(()=>validateEdits({transport:[['Vieta','Tekstas','javascript:alert(1)']]}));
 assert.throws(()=>validateEdits({map:{embedUrl:'<iframe src="https://google.com"></iframe>'}}));
 assert.throws(()=>validateEdits({instagram:{endpoint:'//evil.test/feed'}}));
 assert.throws(()=>validateEdits({contactEmail:'test@example.com?bcc=someone@example.com'}));
});
test('integration settings and reordered lists retain changes',()=>{
 const d=editableDefaults();d.journey.reverse();d.journey.push({id:'nauja',title:'Nauja',cue:'',text:'',detail:''});d.tickets.eventId='NEW_EVENT';d.instagram.autoplay=false;
 const v=validateEdits(d);assert.equal(v.journey.at(-1).id,'nauja');assert.equal(v.tickets.eventId,'NEW_EVENT');assert.equal(v.instagram.autoplay,false);
 d.journey[0].id='nauja';assert.throws(()=>validateEdits(d));d.journey[0].id='bad id';assert.throws(()=>validateEdits(d));
});
test('malformed, oversized and out of range values fail validation',()=>{
 for(const value of [null,[],{story:5},{story:'a'.repeat(10001)},{journey:[]},{faq:[]},{faq:[['one']]},{final:null},{instagram:{limit:6}},{instagram:{refreshMs:1}},{season:{mode:'bad'}},{appearance:{motion:'yes'}}])assert.throws(()=>validateEdits(value));
 const large=editableDefaults();for(const k of Object.keys(large.copy))large.copy[k]='ą'.repeat(9000);assert.throws(()=>validateEdits(large));
});
test('plain text and editable transport links stay literal',()=>{
 const d={story:'<script>alert(1)</script>',ticketTypes:['Vienas'],transport:[['Testas','Tekstas','https://judu.lt/']]};assert.deepEqual(validateEdits(d),d);
});
test('only complete invitation callbacks switch from PKCE',()=>{
 assert.equal(authFlow(''),'pkce');assert.equal(authFlow('#type=invite'),'pkce');assert.equal(authFlow('#type=magiclink&access_token=test&refresh_token=test'),'pkce');assert.equal(authFlow('#type=invite&access_token=test&refresh_token=test'),'implicit');
});
