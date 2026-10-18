import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeEdits, validateEdits, editableDefaults } from '../src/editable-content.js';
import { subpageDefaults } from '../src/subpage-defaults.js';
import { localize,guideUrl } from '../src/locale.js';
import { readFileSync } from 'node:fs';
test('old CMS content gains complete subpage defaults without losing saved text', () => {
  const data = mergeEdits({name:'Išsaugotas vardas'});
  assert.equal(data.name,'Išsaugotas vardas');
  assert.deepEqual(data.guide,editableDefaults().guide);
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
test('English guide retains shared map, meeting times and links from old published content',()=>{
  const data=mergeEdits({guide:{text18:'18:30',src12:'/gidas/new-map.jpg',href65:'/gidas/new-guide.pdf'},translations:{en:{tagline:'Saved English tagline'}}});
  const en=localize(data,'en');
  assert.equal(en.guide.text5,'Your forest guide');
  assert.equal(en.guide.text18,'18:30');assert.equal(en.guide.src12,'/gidas/new-map.jpg');assert.equal(en.guide.href65,'/gidas/new-guide.pdf');
  assert.equal(en.tagline,'Saved English tagline');assert.equal(data.guide.text5,'Tavo Miško gidas');
});
test('English guide edits publish independently and reject non-text integration overrides',()=>{
  const data=mergeEdits({translations:{en:{guide:{text5:'Edited guide',text41:'Saved English story'}}}});
  assert.equal(localize(validateEdits(data),'en').guide.text41,'Saved English story');
  assert.equal(localize(data,'lt').guide.text5,'Tavo Miško gidas');
  assert.throws(()=>validateEdits({translations:{en:{guide:{src12:'javascript:alert(1)'}}}}));
});
test('both guide routes preserve section links and English HTML has a translated fallback',()=>{
  assert.equal(guideUrl('en','?adminPreview=1','#laikai'),'/en/gidas/?adminPreview=1#laikai');
  assert.equal(guideUrl('lt','','#vietos'),'/gidas/#vietos');
  const html=readFileSync(new URL('../en/gidas/index.html',import.meta.url),'utf8');
  assert.match(html,/<html lang="en">/);assert.match(html,/Your forest guide/);assert.match(html,/Additional charge applies/);
  for(const match of html.matchAll(/data-cms-(?:text|alt|aria-label)="([^"]+)"/g))assert.equal(typeof localize(editableDefaults(),'en').guide[match[1]],'string',match[1]);
  assert.equal((html.match(/class="num"/g)||[]).length,15);
});
