import React from 'react';
import {useTicketEvents} from './useTicketEvents';
import {locale,ui} from './locale';
export function TicketHours(){
 const {events}=useTicketEvents();
 const date=new Intl.DateTimeFormat(locale==='en'?'en-GB':'lt-LT',{timeZone:'Europe/Vilnius',month:'long',day:'numeric'});
 const time=new Intl.DateTimeFormat('lt-LT',{timeZone:'Europe/Vilnius',hour:'2-digit',minute:'2-digit'});
 const parts=d=>{const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Vilnius',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);return Object.fromEntries(p.map(x=>[x.type,x.value]));};
 const groups=[];
 for(const e of events){const start=new Date(e.eventStartAt),end=new Date(e.eventEndAt),p=parts(start),day=Date.UTC(+p.year,+p.month-1,+p.day),hours=time.format(start)+'–'+time.format(end),last=groups.at(-1);
 if(last&&last.hours===hours&&last.day+86400000===day&&last.month===p.month){last.end=start;last.day=day;}else groups.push({id:e.id,start,end:start,day,month:p.month,hours});}
 const dayNumber=d=>parts(d).day.replace(/^0/,'');
 const label=g=>g.start===g.end?date.format(g.start):locale==='en'?dayNumber(g.start)+'–'+date.format(g.end):date.format(g.start).replace(/\d+ d\.$/,dayNumber(g.start)+'–'+dayNumber(g.end)+' d.');
 if(!events.length)return null;
 return <div className="ticket-hours"><span className="eyebrow">{ui('Apsilankymo datos ir darbo laikas','Visit dates and opening hours')}</span><dl>{groups.map(g=><div key={g.id}><dt>{label(g)}</dt><dd>{g.hours}</dd></div>)}</dl></div>
}
