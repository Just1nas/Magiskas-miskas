import test from 'node:test';
import assert from 'node:assert/strict';
import { editableDefaults, mergeEdits, validateEdits } from '../src/editable-content.js';
import { localize, languageUrl, asset } from '../src/locale.js';
test('legacy CMS documents retain LT and receive complete English defaults',()=>{
 const doc=mergeEdits({tagline:'Naujas šūkis',season:{mode:'closed'},tickets:{widgetId:'live-widget'},transport:[['Automobiliu','Tekstas','https://example.com/']]});
 const en=localize(doc,'en');
 assert.equal(doc.tagline,'Naujas šūkis');assert.equal(localize(doc,'lt').tagline,'Naujas šūkis');
 assert.equal(en.tagline,'As nature sleeps, magic awakens');assert.equal(en.season.mode,'closed');assert.equal(en.tickets.widgetId,'live-widget');assert.equal(en.transport[0][2],'https://example.com/');
 assert.deepEqual(en.map,doc.map);assert.deepEqual(en.instagram,doc.instagram);
});
test('English text changes round trip independently and cannot override shared integrations',()=>{
 const doc=editableDefaults();doc.translations.en.faq[0][1]='Edited answer';
 const checked=validateEdits(doc);assert.equal(localize(checked,'en').faq[0][1],'Edited answer');assert.notEqual(localize(checked,'lt').faq[0][1],'Edited answer');
 doc.translations.en.tickets.url='https://example.com';assert.throws(()=>validateEdits(doc));
});
test('English nested arrays validate with the same limits and safety as LT',()=>{
 assert.throws(()=>validateEdits({translations:{en:{faq:[['Broken']]}}}));
 assert.throws(()=>validateEdits({translations:{en:{transport:[['Car','Info','javascript:alert(1)']]}}}));
 const doc=editableDefaults();doc.translations.en.journey[1].id=doc.translations.en.journey[0].id;assert.throws(()=>validateEdits(doc));
});
test('language routes preserve section and preview while assets resolve from root',()=>{
 assert.equal(languageUrl('en','?intro=1','#duk'),'/en/?intro=1#duk');assert.equal(languageUrl('lt','','#bilietai'),'/#bilietai');assert.equal(asset('instagram/123-abc.jpg'),'/instagram/123-abc.jpg');assert.equal(asset('https://example.com/a.jpg'),'https://example.com/a.jpg');
});
