import test from 'node:test';
import assert from 'node:assert/strict';
import { safeHttps, normalizePosts } from '../src/integrations.js';
const post = (id, timestamp = '2026-09-30T12:00:00Z') => ({id, timestamp, permalink:`https://www.instagram.com/p/${id}/`,caption:'Tikras įrašas'});
test('external integrations reject unsafe protocols and lookalike domains',()=>{
 assert.equal(safeHttps('javascript:alert(1)'), '');
 assert.equal(safeHttps('https://bilietai.lt.evil.test', ['bilietai.lt']), '');
 assert.equal(safeHttps('https://user:password@bilietai.lt', ['bilietai.lt']), '');
 assert.equal(safeHttps('https://www.bilietai.lt/', ['bilietai.lt']), 'https://www.bilietai.lt/');
});
test('feed deduplicates, validates links and dates, sorts newest first, limits to 5',()=>{
 const posts=[post('old','2026-01-01'),post('new'),post('new'),{...post('bad'),permalink:'https://evil.test/'},{...post('date'),timestamp:'never'},...['a','b','c','d','e'].map(x=>post(x,'2026-06-01'))];
 const result=normalizePosts({posts},9);assert.equal(result.length,5);assert.equal(result[0].id,'new');assert.equal(new Set(result.map(x=>x.id)).size,5);assert.ok(result.every(x=>x.id!=='bad'&&x.id!=='date'));
});
test('empty feed is valid but invalid payload triggers unavailable state',()=>{
 assert.deepEqual(normalizePosts({posts:[]}),[]);assert.throws(()=>normalizePosts({data:[]}));assert.throws(()=>normalizePosts(null));
});
test('captions are bounded and missing captions have an honest fallback',()=>{
 assert.equal(normalizePosts({posts:[{...post('a'),caption:'x'.repeat(1000)}]})[0].caption.length,500);
 assert.equal(normalizePosts({posts:[{...post('a'),caption:null}]})[0].caption,'Naujas įrašas iš Magiško Miško');
});

test('gallery uses images and video thumbnails, rejects unsafe media URLs',()=>{
 const images=normalizePosts({posts:[{...post('photo'),media_url:'https://cdn.example.org/photo.jpg'},{...post('video'),media_type:'VIDEO',media_url:'https://cdn.example.org/video.mp4',thumbnail_url:'https://cdn.example.org/cover.jpg'},{...post('unsafe'),media_url:'javascript:alert(1)'}]});
 assert.equal(images[0].image,'https://cdn.example.org/photo.jpg');
 assert.equal(images[1].image,'https://cdn.example.org/cover.jpg');
 assert.equal(images[2].image,'');
});
test('embeds accept only Instagram post paths, not profiles or redirects',async()=>{
 const {instagramEmbed}=await import('../src/integrations.js');
 assert.equal(instagramEmbed('https://www.instagram.com/magiskas.miskas/reel/Dd4D0m0NxMq/'),'https://www.instagram.com/reel/Dd4D0m0NxMq/embed/');
 assert.equal(instagramEmbed('https://www.instagram.com/p/real_post/'),'https://www.instagram.com/p/real_post/embed/');
 for(const url of ['https://instagram.com/','https://instagram.com/magiskas.miskas/','https://instagram.com.evil.test/p/a/','javascript:alert(1)','https://instagram.com/accounts/login/']) assert.equal(instagramEmbed(url),'');
});
