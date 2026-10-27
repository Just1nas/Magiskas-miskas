import {useTicketEvents} from './useTicketEvents';
import { ui, locale } from './locale';
import React, { useEffect, useRef, useState } from 'react';
import { content as c } from './content';
import './ticketLayout.css';
import { TICKET_SERIES_URL } from './ticketSelection';
import { ticketTheme, ticketBase, ticketFont, ticketCustomStyles, transparentTicketTheme, transparentTicketStyles } from './ticketTheme';

const SCRIPT_URL = 'https://www.bilietai.lt/_widgets/widget.iife.js';
let scriptReady;
function loadScript() {
  // The vendor installs global listeners: load once, including in React StrictMode.
  if (!scriptReady) scriptReady = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.setAttribute('plg-embed', '');
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', () => {
      script.remove();
      scriptReady = undefined;
      reject(new Error('Widget unavailable'));
    }, { once: true });
    document.body.appendChild(script);
  });
  return scriptReady;
}

export function TicketWidget({ widgetId, transparent = false }) {
  const host = useRef(null);
  const {events,eventId,setEventId}=useTicketEvents();
  const [state, setState] = useState('loading');
  useEffect(() => {
    if (!eventId || !host.current) return;
    setState('loading');
    let stopped = false, frame, timeout;
    const loaded = () => { clearTimeout(timeout); if (!stopped) setState('ready'); };
    const observeFrame = () => {
      const next = host.current?.querySelector('iframe');
      if (!next || next === frame) return;
      frame?.removeEventListener('load', loaded);
      frame = next;
      frame.title = ui('Magiško Miško bilietų pasirinkimas – Bilietai.lt','Magiškas Miškas ticket selection — Bilietai.lt');
      frame.addEventListener('load', loaded, { once: true });
    };
    const observer = new MutationObserver(observeFrame);
    observer.observe(host.current, { childList: true });
    observeFrame();
    timeout = setTimeout(() => { if (!stopped) setState('slow'); }, 20000);
    loadScript().then(() => {
      if (stopped || !host.current) return;
      const params = new URLSearchParams(host.current.dataset);
      const src = `https://www.bilietai.lt/widget/list?${params}`;
      // The vendor only discovers embeds on its first load. Also support remounts/date changes.
      const existing = host.current.querySelector('iframe');
      if (existing) { if (existing.src !== src) existing.src = src; }
      else {
        const iframe = document.createElement('iframe');
        iframe.src = src; iframe.width = '100%'; iframe.height = '400';
        iframe.style.cssText = 'min-height:60lvh;border:none;position:relative';
        iframe.id = `plg-widget-${widgetId}`;
        host.current.appendChild(iframe);
      }
    }).catch(() => { clearTimeout(timeout); if (!stopped) setState('error'); });
    return () => { stopped = true; clearTimeout(timeout); observer.disconnect(); frame?.removeEventListener('load', loaded); };
  }, [eventId, widgetId, transparent]);
  if (!eventId) return <p role="status">{ui('Šiuo metu daugiau paskelbtų renginių nėra.','There are no more scheduled events at the moment.')} <a href={TICKET_SERIES_URL} target="_blank" rel="noopener noreferrer">{ui('Tikrinti datas Bilietai.lt','Check dates on Bilietai.lt')}</a></p>;
  return <div className="ticket-widget">
    <div className="ticket-date-choice"><label htmlFor="ticket-visit-date">{ui('Apsilankymo diena','Visit date')}</label><select id="ticket-visit-date" value={eventId} onChange={e=>setEventId(e.target.value)}>{events.map(event=><option key={event.id} value={event.id}>{new Intl.DateTimeFormat(locale==='en'?'en-GB':'lt-LT',{timeZone:'Europe/Vilnius',weekday:'long',month:'long',day:'numeric'}).format(new Date(event.eventStartAt))}</option>)}</select><p>{ui('Pasirink atvykimo laiką, tada prie bilieto rūšies spausk + arba −.','Choose an arrival time, then use + or − beside each ticket type.')}</p></div>
    <details className="ticket-checkout-help"><summary>{ui('Kaip tęsti pirkimą?','How do I continue?')}</summary><p>{ui('Pasirinkęs kiekius spausk „Rinktis bilietus“, tada „Įdėti į krepšelį“. Prieš apmokėjimą Bilietai.lt suvestinėje patikrink dieną, laiką, bilietus ir galutinę sumą su mokesčiais.','After selecting quantities, choose tickets and add them to the basket. Before paying, check the date, time, tickets and total including fees in the Bilietai.lt order summary.')}</p></details>
    {state !== 'ready' && <p className="widget-status" role="status">{state === 'loading' ? ui('Kraunamas bilietų pasirinkimas…','Loading ticket selection…') : ui('Bilietų pasirinkimas neįsikrovė. Atidaryk renginį Bilietai.lt žemiau esančia nuoroda.','Ticket selection could not load. Use the link below to open the event on Bilietai.lt.')}</p>}
    <div ref={host} plg-widget="" data-widget-id={widgetId} data-language={locale} data-event-id={eventId} data-sp={c.tickets.provider} data-theme={JSON.stringify(transparent ? transparentTicketTheme : ticketTheme)} data-base={JSON.stringify(ticketBase)} data-font={JSON.stringify(ticketFont)} data-custom-styles={transparent ? transparentTicketStyles : ticketCustomStyles} />
  </div>;
}
