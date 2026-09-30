import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEmbedVideo } from '../scripts/refresh-instagram.js';
import { safeGalleryVideo, normalizePosts } from '../src/integrations.js';
test('video embed accepts only the matching post and approved media host',()=>{
 const fixture=post=>`handle(${JSON.stringify(JSON.stringify({data:{post}}))});`;
 const post={shortcode:'Abc_1',is_video:true,video_url:'https://scontent.cdninstagram.com/video.mp4'};
 assert.equal(parseEmbedVideo(fixture(post),'Abc_1'),post.video_url);
 assert.equal(parseEmbedVideo(fixture(post),'another'),'');
 assert.equal(parseEmbedVideo(fixture({...post,video_url:'https://evil.test/a.mp4'}),'Abc_1'),'');
});
test('gallery preserves safe video sources without confusing posters with videos',()=>{
 assert.equal(safeGalleryVideo('instagram/123-abcdef123456.mp4'),'instagram/123-abcdef123456.mp4');
 assert.equal(safeGalleryVideo('javascript:alert(1)'),'');
 const p={id:'123',permalink:'https://www.instagram.com/reel/Abc_1/',timestamp:'2026-09-29',media_type:'VIDEO',thumbnail_url:'instagram/123-abcdef123456.jpg'};
 assert.equal(normalizePosts({posts:[p]})[0].video,'');
 assert.equal(normalizePosts({posts:[{...p,video_url:'instagram/123-abcdef123456.mp4'}]})[0].video,'instagram/123-abcdef123456.mp4');
});
