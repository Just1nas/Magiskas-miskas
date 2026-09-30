// Supabase administrator invitations use an implicit callback, not PKCE.
// Ordinary magic links retain PKCE. Supabase still verifies every access token.
export function authFlow(hash = '') {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return params.get('type') === 'invite' && params.has('access_token') && params.has('refresh_token') ? 'implicit' : 'pkce';
}
