import { scrypt as derive, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt=promisify(derive);
const options={N:32768,r:8,p:1,maxmem:64*1024*1024};
export function validPassword(value){return typeof value==='string'&&value.length>=12&&value.length<=128;}
export async function hashPassword(value){
  if(!validPassword(value))throw Object.assign(new Error('Slaptažodis turi būti 12–128 simbolių.'),{status:400});
  const salt=randomBytes(16).toString('hex');
  const key=await scrypt(value,salt,64,options);return `scrypt:${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(value,hash){
  const parts=String(hash||'').split(':');
  const valid=parts[0]==='scrypt'&&/^[a-f0-9]{32}$/.test(parts[1])&&/^[a-f0-9]{128}$/.test(parts[2]);
  const key=await scrypt(typeof value==='string'?value.slice(0,128):'',valid?parts[1]:'00000000000000000000000000000000',64,options);
  return !!valid&&validPassword(value)&&timingSafeEqual(key,Buffer.from(parts[2],'hex'));
}
