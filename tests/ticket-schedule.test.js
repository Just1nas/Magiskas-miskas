import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {parseTicketSchedule,createTicketSchedule} from '../server/ticket-schedule.js';
import {createApi} from '../server/api.js';
const event={id:'QQLPKECLY3',eventStartAt:'2026-10-22T14:45:00Z',eventEndAt:'2026-10-22T19:00:00Z',status:'ON_SALE'};
test('official series parser validates the full schedule, rejects unrelated data and accepts a confirmed empty series',()=>{
 const data=[{id:1,events:2},'FOPZN745ZJ',[3],{id:4,eventStartAt:5,eventEndAt:6,status:7},event.id,event.eventStartAt,event.eventEndAt,event.status];
 const html=()=>'<script id="__NUXT_DATA__">'+JSON.stringify(data)+'</script>';
 assert.deepEqual(parseTicketSchedule(html()),[event]);
 data[4]='bad/url';assert.throws(()=>parseTicketSchedule(html()));data[4]=event.id;
 data[1]='OTHER';assert.throws(()=>parseTicketSchedule(html()));data[1]='FOPZN745ZJ';data[2]=[];
 assert.deepEqual(parseTicketSchedule(html()),[]);assert.throws(()=>parseTicketSchedule('<html>Login</html>'));
});
test('runtime refresh discovers new dates without a build, shares requests and retains verified dates on failure',async()=>{
 let time=1000,calls=0,fail=false,source=[event],release;
 const cache=createTicketSchedule({now:()=>time,initial:[],ttl:300000,fetchEvents:async()=>{calls++;await new Promise(r=>release=r);if(fail)throw Error('Vendor offline');return source;}});
 const first=cache.read(),second=cache.read();release();
 assert.deepEqual((await first).events,[event]);await second;assert.equal(calls,1);
 await cache.read();assert.equal(calls,1);
 time+=300000;source=[event,{...event,id:'POQWSEKKFU',eventStartAt:'2026-11-08T14:45:00Z',eventEndAt:'2026-11-08T19:00:00Z'}];
 const updated=cache.read();release();assert.equal((await updated).events.length,2);
 time+=300000;fail=true;const failed=cache.read();release();assert.equal((await failed).events.length,2);
 fail=false;time+=300000;source=[];const empty=cache.read();release();assert.deepEqual((await empty).events,[]);
});
test('public schedule API is available without editor credentials and is not cached',async()=>{
 const api=createApi({db:{},origin:'https://www.magiskasmiskas.lt',readTicketEvents:async()=>({events:[event],checkedAt:'2026-10-21T10:00:00Z'})});
 const req=Readable.from([]);req.url='/api/ticket-events';req.method='GET';req.headers={};
 let status,headers,body;await api(req,{writeHead(s,h){status=s;headers=h},end(t){body=JSON.parse(t)}});
 assert.equal(status,200);assert.equal(headers['Cache-Control'],'no-store');assert.deepEqual(body.events,[event]);
});
