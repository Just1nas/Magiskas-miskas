import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePublicProfile, safeMediaUrl} from '../scripts/refresh-instagram.js';
import {safeGalleryImage} from '../src/integrations.js';
const media = (id, date = 1790694906) => ({shortcode_media:{id,shortcode:`post_${id}`,owner:{username:'magiskas.miskas'},taken_at_timestamp:date,is_video:true,display_url:'https://scontent.cdninstagram.com/post.jpg',edge_media_to_caption:{edges:[{node:{text:'Tikras\\nįrašas'}}]}}});
const html = context => `<script>init({"contextJSON":${JSON.stringify(JSON.stringify({context}))}})</script>`;
test('public feed verifies ownership, removes duplicates and orders newest first',()=>{
 const posts=parsePublicProfile(html({username:'magiskas.miskas',graphql_media:[media('1'),media('2',1790704906),media('1'),null,{shortcode_media:{...media('3').shortcode_media,owner:{username:'someone.else'}}}]}));
 assert.deepEqual(posts.map(x=>x.id),['2','1']); assert.equal(posts[0].caption,'Tikras\nįrašas');assert.equal(posts[0].permalink,'https://www.instagram.com/reel/post_2/');
});
test('challenge, empty data or unrelated account fails without creating an empty feed',()=>{
 for(const input of ['<html>Log in</html>',html({username:'other',graphql_media:[media('1')]}),html({username:'magiskas.miskas',graphql_media:[]})]) assert.throws(()=>parsePublicProfile(input));
});
test('media fetch rejects arbitrary hosts, protocols, user info and lookalike domains',()=>{
 for(const url of ['http://cdninstagram.com/a','https://cdninstagram.com.evil.test/a','https://127.0.0.1/a','https://user:pass@scontent.cdninstagram.com/a','file:///tmp/a'])assert.equal(safeMediaUrl(url),'');
 assert.equal(safeMediaUrl('https://scontent.cdninstagram.com/a.jpg'),'https://scontent.cdninstagram.com/a.jpg');
});
test('client permits only generated local gallery paths',()=>{
 assert.equal(safeGalleryImage('instagram/123-0123456789ab.jpg'),'instagram/123-0123456789ab.jpg');
 for(const path of ['../private.jpg','instagram/../../private.jpg','//evil.test/a.jpg','data:image/svg+xml,test'])assert.equal(safeGalleryImage(path),'');
});
