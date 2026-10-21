import test from 'node:test';
import assert from 'node:assert/strict';
import {updateConfirmedEnglish,confirmedAccessibility} from '../src/confirmed-english.js';
import {migrateConfirmedEnglish} from '../server/confirmed-english.js';
const original={duration:'1-2 h',hours:'17:30 - 22:00',story:'Gabijos tekstas',translations:{en:{duration:'Duration to be confirmed',hours:'Opening hours will be announced soon',practical:[['Accessibility','Details about path surfaces, pushchairs and mobility access will be confirmed before the event.']],faq:[['How long is the walk?','The recommended visit duration will be confirmed before the event.'],['Can I bring a pushchair?','Path surface and accessibility details are being confirmed and will be announced before ticket sales begin.']]}}};
test('confirmed English replaces only known placeholders, preserves edits and is idempotent',()=>{
 const result=updateConfirmedEnglish(original);
 assert.equal(result.translations.en.duration,'1–2 hours');assert.equal(result.translations.en.hours,original.hours);
 assert.equal(result.translations.en.practical[0][1],confirmedAccessibility);assert.equal(result.translations.en.faq[1][1],confirmedAccessibility);
 assert.equal(result.story,original.story);assert.equal(original.translations.en.duration,'Duration to be confirmed');
 assert.deepEqual(updateConfirmedEnglish(result),result);
 result.translations.en.duration='Edited duration';result.translations.en.faq[1][1]='Edited access';
 assert.deepEqual(updateConfirmedEnglish(result),result);
});
test('CMS correction keeps revision history once and leaves already edited content untouched',async()=>{
 let content=structuredClone(original),revision=25,history=[],backups=[];let commits=0;
 const conn={beginTransaction:async()=>{},commit:async()=>{commits++},rollback:async()=>{throw Error('Unexpected rollback')},release(){},async execute(sql,p=[]){
  if(sql.startsWith('SELECT'))return [[{content:JSON.stringify(content),revision}]];
  if(sql.startsWith('INSERT')){history.push(p);return [{}]}
  if(sql.startsWith('UPDATE')){content=JSON.parse(p[0]);revision++;return [{}]}
  throw Error('Unexpected query');
 }};
 const db={getConnection:async()=>conn},backup=async(...p)=>backups.push(p);
 await migrateConfirmedEnglish(db,backup);await migrateConfirmedEnglish(db,backup);
 assert.equal(revision,26);assert.equal(history.length,1);assert.deepEqual(JSON.parse(history[0][0]),original);
 assert.equal(backups.length,1);assert.equal(backups[0][1],26);assert.equal(commits,2);
});
