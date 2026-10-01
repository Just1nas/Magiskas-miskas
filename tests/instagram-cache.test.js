import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { readInstagramCache,isInstagramFresh } from '../src/instagram-feed.js';
test('authoritative empty feed stays empty and cache failures do not resurrect static posts',async()=>{
 const row={feed:{posts:[]},checked_at:'2026-10-01T11:20:00Z'};
 const result=await readInstagramCache('https://example.supabase.co','public-key',undefined,async(url,options)=>{
  assert.match(url,/select=feed,checked_at/);assert.equal(options.cache,'no-store');return {ok:true,json:async()=>[row]};
 });
 assert.deepEqual(result.feed.posts,[]);
 await assert.rejects(readInstagramCache('https://example.supabase.co','key',undefined,async()=>({ok:false})));
 assert.equal(isInstagramFresh(row.checked_at,Date.parse('2026-10-01T11:34:59Z')),true);
 assert.equal(isInstagramFresh(row.checked_at,Date.parse('2026-10-01T11:35:00Z')),false);
 assert.equal(isInstagramFresh(null),false);
});
const source=readFileSync(new URL('../supabase/functions/instagram-refresh/index.ts',import.meta.url),'utf8');
const parser=source.slice(source.indexOf('export function parsePublicProfile'),source.indexOf('export function safeMediaUrl')).replace('export function','function');
const parse=vm.runInNewContext(`const ACCOUNT='magiskas.miskas';${parser};parsePublicProfile`);
const embed=posts=>JSON.stringify({contextJSON:JSON.stringify({context:{username:'magiskas.miskas',graphql_media:posts.map(shortcode_media=>({shortcode_media}))}})});
const post=id=>({id,shortcode:'p'+id,owner:{username:'magiskas.miskas'},taken_at_timestamp:1790850000,is_video:false,display_url:'https://x.cdninstagram.com/a.jpg'});
test('server profile parser returns current membership, including all posts removed',()=>{
 assert.equal(parse(embed([post('1'),post('2')])).length,2);
 assert.equal(parse(embed([post('2')])).map(x=>x.id).join(','),'2');
 assert.equal(parse(embed([])).length,0);
 assert.throws(()=>parse('<html>Login challenge</html>'));
 assert.throws(()=>parse(embed([{id:'invalid'}])));
});
