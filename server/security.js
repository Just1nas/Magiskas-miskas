import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
export const token = () => randomBytes(32).toString('hex');
export const digest = value => createHash('sha256').update(value).digest('hex');
export const validToken = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
export function equalToken(a,b) { return validToken(a) && validToken(b) && timingSafeEqual(Buffer.from(a),Buffer.from(b)); }
export function assertOrigin(request, origin) {
  if (request.headers.origin !== origin || request.headers['sec-fetch-site'] === 'cross-site') throw Object.assign(new Error('Forbidden origin'),{status:403});
}
export function sessionCookie(value, production=true, expired=false) {
  return `${production?'__Host-':''}mm_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${expired?0:43200}${production?'; Secure':''}`;
}
export function readSession(request,production=true) {
  const name=`${production?'__Host-':''}mm_session=`;
  const value=(request.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(name))?.slice(name.length);
  return validToken(value)?value:null;
}
