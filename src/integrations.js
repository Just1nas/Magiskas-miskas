export function safeHttps(value, hosts) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && (!hosts || hosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))) ? url.href : '';
  } catch { return ''; }
}
export function safeGalleryImage(value) {
  return typeof value === 'string' && /^instagram\/\d+-[a-f0-9]{12}\.jpg$/.test(value) ? value : safeHttps(value);
}
export function safeGalleryVideo(value) {
  return typeof value === 'string' && /^instagram\/\d+-[a-f0-9]{12}\.mp4$/.test(value) ? value : safeHttps(value);
}
export function normalizePosts(payload, limit = 4) {
  if (!Array.isArray(payload?.posts)) throw new Error('Invalid feed');
  const seen = new Set();
  return payload.posts.filter(post => {
    if (!post || typeof post.id !== 'string' || seen.has(post.id) || !safeHttps(post.permalink, ['instagram.com']) || !Number.isFinite(Date.parse(post.timestamp))) return false;
    seen.add(post.id); return true;
  }).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, Math.max(3, Math.min(5, limit))).map(post => ({
    id: post.id, permalink: safeHttps(post.permalink, ['instagram.com']), timestamp: post.timestamp,
    caption: typeof post.caption === 'string' ? post.caption.slice(0, 500) : 'Naujas įrašas iš Magiško Miško',
    media_type: post.media_type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
    video: post.media_type === 'VIDEO' ? safeGalleryVideo(post.video_url) : '',
    image: safeGalleryImage(post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url),
  }));
}

export function instagramEmbed(value) {
  const valid = safeHttps(value, ['instagram.com']);
  if (!valid) return '';
  const match = new URL(valid).pathname.match(/^\/(?:[\w.]+\/)?(p|reel)\/([\w-]+)\/?$/);
  return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/` : '';
}
