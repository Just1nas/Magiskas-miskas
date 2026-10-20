import test from 'node:test';
import assert from 'node:assert/strict';
import {logicalSlide,nearestSlide,restingSlide} from '../src/gallery-position.js';
test('every post can lead a full desktop row, then wrap without changing its identity',()=>{
  const count=5, positions=Array.from({length:15},(_,i)=>i*290);
  for(let i=0;i<count;i++){
    const physical=restingSlide(i,count,true);
    assert.equal(nearestSlide(positions,physical*290),physical);
    assert.equal(logicalSlide(physical,count),i);
    const visible=Array.from({length:4},(_,n)=>logicalSlide(physical+n,count));
    assert.equal(new Set(visible).size,4);
  }
  assert.equal(restingSlide(10,count,true),5);
  assert.equal(restingSlide(4,count,true),9);
});
test('single and non-overflowing galleries do not need repeated neighbours',()=>{
  assert.equal(restingSlide(0,1,false),0);
  assert.equal(restingSlide(3,3,false),0);
  assert.equal(logicalSlide(-1,5),4);
  assert.equal(nearestSlide([0,300,600],590),2);
});
