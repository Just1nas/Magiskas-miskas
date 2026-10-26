import test from 'node:test';
import assert from 'node:assert/strict';
import {specialHours} from '../src/special-hours.js';
test('confirmed November closure and daily opening appear in both languages until Vilnius midnight',()=>{
 const last=Date.parse('2026-11-08T23:59:59+02:00');
 assert.match(specialHours('lt',last).closed,/1–2/);
 assert.match(specialHours('en',last).open,/daily 3–8/);
 assert.equal(specialHours('lt',last+1000),null);
 assert.equal(specialHours('en',last+1000),null);
});
