import {useEffect,useState} from 'react';
import ticketEvents from './ticket-events.json';
import {availableTicketEvents,selectTicketEvent} from './ticketSelection';
export function useTicketEvents(){
  const [events,setEvents]=useState(()=>availableTicketEvents(ticketEvents));
  const [eventId, setEventId] = useState(() => selectTicketEvent(ticketEvents)?.id ?? null);
  useEffect(() => {
    let source=ticketEvents,stopped=false,pending=false;
    const controller=new AbortController();
    const apply = () => {if(stopped)return;const next=availableTicketEvents(source);setEvents(next);setEventId(previous=>next.some(event=>event.id===previous)?previous:next[0]?.id??null);};
    const refresh=async()=>{if(pending||stopped)return;pending=true;try{
      const response=await fetch('/api/ticket-events',{cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])});
      if(!response.ok)throw Error('Schedule unavailable');const data=await response.json();
      if(!Array.isArray(data.events)||!data.events.every(e=>e&&/^[A-Z0-9]{10}$/.test(e.id)&&typeof e.status==='string'&&Number.isFinite(Date.parse(e.eventStartAt))&&Number.isFinite(Date.parse(e.eventEndAt))))throw Error('Invalid schedule');
      source=data.events;
    }catch{ /* Keep verified dates on a temporary failure. */ }finally{pending=false;apply();}};
    refresh();const timer=setInterval(apply,30000),updates=setInterval(refresh,300000);
    window.addEventListener('focus',refresh);
    return () => {stopped=true;controller.abort();clearInterval(timer);clearInterval(updates);window.removeEventListener('focus',refresh);};
  }, []);
  return {events,eventId,setEventId};
}
