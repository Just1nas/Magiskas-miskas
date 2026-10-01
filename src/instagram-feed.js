// The server cache is authoritative, including an intentionally empty gallery.
export async function readInstagramCache(url, key, signal, request = fetch) {
  const response = await request(`${url}/rest/v1/instagram_cache?id=eq.1&select=feed,checked_at`, {
    headers: { apikey: key }, signal, credentials: 'omit', cache: 'no-store',
  });
  if (!response.ok) throw new Error('Instagram cache unavailable');
  const rows = await response.json();
  const row = rows?.[0];
  if (!row || !Array.isArray(row.feed?.posts) || !Number.isFinite(Date.parse(row.checked_at))) throw new Error('Instagram cache not ready');
  return { feed: row.feed, checkedAt: row.checked_at };
}
export function isInstagramFresh(checkedAt, now = Date.now()) {
  const age = now - Date.parse(checkedAt);
  return Number.isFinite(age) && age >= -60000 && age < 15 * 60000;
}
