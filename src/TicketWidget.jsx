import React, { useEffect, useRef, useState } from 'react';
import { ticketWidgetRouting, ticketTheme, ticketBase, ticketFont, ticketCustomStyles } from './ticketTheme';

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
    script.addEventListener('error', () => reject(new Error('Widget unavailable')), { once: true });
    document.body.appendChild(script);
  });
  return scriptReady;
}

export function TicketWidget({ widgetId }) {
  const host = useRef(null);
  const [state, setState] = useState('loading');
  useEffect(() => {
    let stopped = false, frame, timeout;
    const loaded = () => { clearTimeout(timeout); if (!stopped) setState('ready'); };
    const observeFrame = () => {
      const next = host.current?.querySelector('iframe');
      if (!next || next === frame) return;
      frame?.removeEventListener('load', loaded);
      frame = next;
      frame.title = 'Magiško Miško bilietų pasirinkimas – Bilietai.lt';
      frame.addEventListener('load', loaded, { once: true });
    };
    const observer = new MutationObserver(observeFrame);
    observer.observe(host.current, { childList: true });
    observeFrame();
    timeout = setTimeout(() => { if (!stopped) setState('slow'); }, 20000);
    loadScript().catch(() => { clearTimeout(timeout); if (!stopped) setState('error'); });
    return () => { stopped = true; clearTimeout(timeout); observer.disconnect(); frame?.removeEventListener('load', loaded); };
  }, []);
  return <div className="ticket-widget">
    {state !== 'ready' && <p className="widget-status" role="status">{state === 'loading' ? 'Kraunamas bilietų pasirinkimas…' : 'Bilietų pasirinkimas neįsikrovė. Atidaryk renginį Bilietai.lt žemiau esančia nuoroda.'}</p>}
    <div ref={host} plg-widget="" data-widget-id={widgetId} data-language="lt" data-event-id={ticketWidgetRouting.eventId} data-sp={ticketWidgetRouting.sp} data-theme={JSON.stringify(ticketTheme)} data-base={JSON.stringify(ticketBase)} data-font={JSON.stringify(ticketFont)} data-custom-styles={ticketCustomStyles} />
  </div>;
}
