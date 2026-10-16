import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword,verifyPassword } from '../server/passwords.js';
test('passwords use salted scrypt and reject wrong or malformed credentials',async()=>{
  const value='Test only long password 123';
  const a=await hashPassword(value),b=await hashPassword(value);
  assert.notEqual(a,b);assert.equal(a.includes(value),false);
  assert.equal(await verifyPassword(value,a),true);
  assert.equal(await verifyPassword('different password',a),false);
  assert.equal(await verifyPassword(value,null),false);
  await assert.rejects(hashPassword('too short'));
});
