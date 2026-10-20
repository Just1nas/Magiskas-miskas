const ACCOUNT='magiskas.miskas';
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
  }).sort((a,b) => b.taken_at_timestamp - a.taken_at_timestamp);
  // Never replace a working feed with a login page, challenge or partial empty response.
  if (!posts.length && context.graphql_media.length) throw new Error('Invalid media response');
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
export function parseEmbedVideo(html, shortcode) {
  // Decode JSON string literals only; never evaluate the embedded scripts.
  const find = (value, depth = 0) => {
    if (!value || typeof value !== 'object' || depth > 25) return '';
    if (value.shortcode === shortcode && value.is_video && safeMediaUrl(value.video_url)) return safeMediaUrl(value.video_url);
    for (const child of Object.values(value)) { const url = find(child, depth + 1); if (url) return url; }
    return '';
  };
  for (const token of html.match(/"(?:[^"\\]|\\.)*"/g) || []) {
    if (!token.includes('video_url')) continue;
    try { const url = find(JSON.parse(JSON.parse(token))); if (url) return url; } catch {}
  }
  return '';
}

