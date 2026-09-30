import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const ACCOUNT = 'magiskas.miskas';
const ROOT = new URL('../public/instagram/', import.meta.url);
const MAX_BYTES = 5 * 1024 * 1024;
export function parsePublicProfile(html) {
  // Read the public embed's JSON as data; never execute remote JavaScript.
  const match = html.match(/"contextJSON"\s*:\s*("(?:[^"\\]|\\.)*")/);
  if (!match) throw new Error('Instagram public profile data is unavailable; keeping the previous gallery.');
  const context = JSON.parse(JSON.parse(match[1])).context;
  if (context?.username !== ACCOUNT || !Array.isArray(context.graphql_media)) throw new Error('Unexpected Instagram profile.');
  const seen = new Set();
  const posts = context.graphql_media.map(item => item?.shortcode_media).filter(post => {
    if (!post || !/^\d+$/.test(post.id) || !/^[\w-]+$/.test(post.shortcode) || post.owner?.username !== ACCOUNT || !Number.isFinite(post.taken_at_timestamp) || seen.has(post.id)) return false;
    seen.add(post.id); return true;
  }).sort((a,b) => b.taken_at_timestamp - a.taken_at_timestamp).slice(0,5);
  // Never replace a working feed with a login page, challenge or partial empty response.
  if (!posts.length) throw new Error('No public media returned; keeping the previous gallery.');
  return posts.map(post => ({
    id: post.id,
    permalink: `https://www.instagram.com/${post.is_video ? 'reel' : 'p'}/${post.shortcode}/`,
    timestamp: new Date(post.taken_at_timestamp * 1000).toISOString(),
    caption: String(post.edge_media_to_caption?.edges?.[0]?.node?.text || '').replace(/\\n/g, '\n').slice(0,500),
    media_type: post.is_video ? 'VIDEO' : 'IMAGE',
    source: post.display_url,
  }));
}
export function safeMediaUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && (url.hostname.endsWith('.cdninstagram.com') || url.hostname.endsWith('.fbcdn.net')) ? url.href : '';
  } catch { return ''; }
}
async function download(url, image = false) {
  // Redirects are rejected so an untrusted payload cannot switch download hosts.
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MagiskasMiskasGallery/1.0)', 'Accept-Language': 'en' } });
  if (!response.ok) throw new Error(`Instagram returned HTTP ${response.status}; keeping the previous gallery.`);
  const reader = response.body.getReader();
  const chunks = []; let length = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    length += value.length;
    if (length > MAX_BYTES) { await reader.cancel(); throw new Error('Response exceeds size limit.'); }
    chunks.push(value);
  }
  const bytes = Buffer.concat(chunks);
  if (image && !(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)) throw new Error('Unexpected poster image format; expected JPEG.');
  return bytes;
}
export async function refresh() {
  const html = (await download(`https://www.instagram.com/${ACCOUNT}/embed/`)).toString('utf8');
  const sourcePosts = parsePublicProfile(html);
  // Fetch everything before writing: partial failures cannot empty the live gallery.
  const assets = [];
  const posts = [];
  for (const post of sourcePosts) {
    const source = safeMediaUrl(post.source);
    if (!source) throw new Error('Unexpected media host.');
    const bytes = await download(source, true);
    const name = `${post.id}-${createHash('sha256').update(bytes).digest('hex').slice(0,12)}.jpg`;
    assets.push({ name, bytes });
    const { source: _, ...metadata } = post;
    posts.push({ ...metadata, media_url: `instagram/${name}`, thumbnail_url: `instagram/${name}` });
  }
  const data = JSON.stringify({ account: ACCOUNT, posts }, null, 2) + '\n';
  const previous = await readFile(new URL('feed.json', ROOT), 'utf8').catch(() => '');
  if (previous === data) { console.log('Instagram gallery is already current.'); return; }
  await mkdir(ROOT, { recursive: true });
  for (const asset of assets) await writeFile(new URL(asset.name, ROOT), asset.bytes);
  await writeFile(new URL('feed.json', ROOT), data);
  console.log(`Updated gallery with ${posts.length} real public post(s).`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  refresh().catch(error => { console.error(error.message); process.exitCode = 1; });
}
