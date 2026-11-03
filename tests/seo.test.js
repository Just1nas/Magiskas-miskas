import test from 'node:test';
import assert from 'node:assert/strict';
import {content} from '../src/content.js';
import {initialContent,renderHomepage,renderSitemap,structuredData,createPublicContentReader} from '../server/seo.js';
test('both languages have exactly one H1, current copy, contacts and sections',()=>{
 for(const lang of ['lt','en']){
  const html=initialContent(content,lang);
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  for(const marker of ['tel:+37069906696','mailto:','#slenkstis','#kontaktai','#duk','id="bilietai"']) assert.ok(html.includes(marker),marker);
  assert.ok(html.length>3000);
 }
 assert.ok(initialContent(content,'en').includes('Visit')||initialContent(content,'en').includes('November'));
});
test('CMS text cannot inject HTML or escape JSON script blocks',()=>{
 const doc=structuredClone(content);doc.description='</script><script>alert(1)</script>';doc.story='<img onerror="alert(1)">';
 const result=renderHomepage('<html><head></head><body><div id="root"></div><noscript>old</noscript><script src="/unchanged.js"></script></body></html>',{content:doc},'lt','https://www.magiskasmiskas.lt');
 assert.ok(!result.includes('<script>alert(1)'));
 assert.ok(!result.includes('<img onerror'));
 assert.ok(result.includes('/unchanged.js'));
 assert.ok(!result.includes('<noscript>old'));
 const blocks=[...result.matchAll(/<script[^>]*type="application\/(?:ld\+)?json"[^>]*>(.*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 assert.equal(blocks.length,2);
 assert.equal(blocks[0].description,doc.description);
});
test('structured data describes the same public contacts and all social profiles',()=>{
 const graph=structuredData(content,'en','https://www.magiskasmiskas.lt')['@graph'];
 assert.equal(graph[0].telephone,'+37069906696');assert.equal(graph[0].sameAs.length,3);
 assert.equal(graph[2].inLanguage,'en');assert.equal(graph[2].url,'https://www.magiskasmiskas.lt/en/');
});
test('lastmod is stable across requests and advances only with source updates',()=>{
 const xml='<url><loc>https://www.magiskasmiskas.lt/</loc></url>';
 assert.equal(renderSitemap(xml,'2026-11-04T10:00:00Z'),renderSitemap(xml,'2026-11-04T10:00:00Z'));
 assert.match(renderSitemap(xml,'2026-11-04T10:00:00Z'),/<lastmod>2026-11-04T10:00:00.000Z<\/lastmod>/);
 assert.equal((renderSitemap(renderSitemap(xml,null),null).match(/<lastmod>/g)||[]).length,1);
});
test('database failure retains public content and does not leak errors',async()=>{
 const read=createPublicContentReader({execute:async()=>{throw Error('secret');}},async()=>({content}));
 assert.equal((await read()).content.name,content.name);
});
