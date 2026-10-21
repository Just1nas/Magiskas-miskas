import {TICKET_SERIES_URL} from '../src/ticketSelection.js';
export function validTicketEvents(events) {
 return Array.isArray(events)&&events.length<=1000&&events.every(e=>e&&/^[A-Z0-9]{10}$/.test(e.id)&&typeof e.status==='string'&&Number.isFinite(Date.parse(e.eventStartAt))&&Number.isFinite(Date.parse(e.eventEndAt))&&Date.parse(e.eventEndAt)>Date.parse(e.eventStartAt));
}
export function parseTicketSchedule(html) {
 const match=html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
 if(!match)throw Error('Schedule data missing');
 const data=JSON.parse(match[1]);
 if(!Array.isArray(data))throw Error('Invalid schedule');
 const series=data.find(v=>v&&!Array.isArray(v)&&data[v.id]==='FOPZN745ZJ'&&'events' in v);
 if(!series||!Array.isArray(data[series.events]))throw Error('Series missing');
 const events=data[series.events].map(i=>data[i]).map(e=>({id:data[e.id],eventStartAt:data[e.eventStartAt],eventEndAt:data[e.eventEndAt],status:data[e.status]}));
 if(!validTicketEvents(events))throw Error('Invalid schedule');
 return events;
}
export async function fetchTicketSchedule(fetcher=fetch) {
 const response=await fetcher(TICKET_SERIES_URL,{signal:AbortSignal.timeout(10000),redirect:'error'});
 if(!response.ok)throw Error('Ticket schedule unavailable');
 const html=await response.text();if(html.length>5000000)throw Error('Schedule too large');
 return parseTicketSchedule(html);
}
export function createTicketSchedule({initial=[],fetchEvents=fetchTicketSchedule,now=Date.now,ttl=300000}={}) {
 let events=initial,checkedAt=null,attemptedAt=-Infinity,pending;
 const refresh=()=>{
  if(pending)return pending;
  attemptedAt=now();
  pending=(async()=>{try{const next=await fetchEvents();if(!validTicketEvents(next))throw Error('Invalid schedule');events=next;checkedAt=new Date(now()).toISOString();}catch{ /* Retain the verified fallback during vendor outages. */ }})().finally(()=>{pending=null;});
  return pending;
 };
 const read=async()=>{if(now()-attemptedAt>=ttl)await refresh();else if(!checkedAt&&pending)await pending;return {events,checkedAt};};
 return {read,refresh};
}
