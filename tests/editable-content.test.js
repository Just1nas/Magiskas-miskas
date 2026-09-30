import test from 'node:test';
import assert from 'node:assert/strict';
import {content} from '../src/content.js';
import {editableDefaults,validateEdits} from '../src/editable-content.js';
test('all editable defaults preserve existing site text',()=>assert.deepEqual(validateEdits(editableDefaults()),editableDefaults()));
test('editor cannot change integration or prototype keys',()=>{
  for(const key of ['tickets','instagram','map','__proto__','constructor']) assert.throws(()=>validateEdits(JSON.parse(`{"${key}":"bad"}`)));
});
test('transport link and journey IDs always stay anchored to site source',()=>{
  const value=editableDefaults(); value.transport[2][2]='javascript:alert(1)'; value.journey[0].id='changed';
  const checked=validateEdits(value);
  assert.equal(checked.transport[2][2],content.transport[2][2]); assert.equal(checked.journey[0].id,content.journey[0].id);
});
test('reject malformed or oversized content and missing journey zones',()=>{
  for(const value of [null,[],{story:5},{story:'a'.repeat(10001)},{journey:[]},{faq:[]},{faq:[['one']]},{final:null}]) assert.throws(()=>validateEdits(value));
});
test('plain text survives literally and edited FAQ can be added',()=>{
 const value=editableDefaults();value.story='<script>alert(1)</script>';value.faq.push(['Naujas?','Taip.']);
 assert.equal(validateEdits(value).story,value.story);assert.equal(validateEdits(value).faq.length,content.faq.length+1);
});
