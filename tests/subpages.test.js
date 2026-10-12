import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeEdits, validateEdits } from '../src/editable-content.js';
import { subpageDefaults } from '../src/subpage-defaults.js';
test('old CMS content gains complete subpage defaults without losing saved text', () => {
  const data = mergeEdits({name:'Išsaugotas vardas'});
  assert.equal(data.name,'Išsaugotas vardas');
  assert.deepEqual(data.guide,subpageDefaults.guide);
});
test('subpage edits round trip, partial edits retain other fields', () => {
  const key=Object.keys(subpageDefaults.guide).find(k=>k.startsWith('text'));
  const data=mergeEdits({guide:{[key]:'Naujas tekstas <script>'}});
  assert.equal(data.guide[key],'Naujas tekstas <script>');
  assert.deepEqual(validateEdits(data),data);
});
test('unsafe subpage URLs and unknown fields are rejected', () => {
  const key=Object.keys(subpageDefaults.guide).find(k=>k.startsWith('src'));
  assert.throws(()=>validateEdits({guide:{[key]:'javascript:alert(1)'}}));
  assert.throws(()=>validateEdits({guide:{unknown:'x'}}));
});
