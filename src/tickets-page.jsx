import React from 'react';
import { createRoot } from 'react-dom/client';
import { TicketWidget } from './TicketWidget';
import { content as c } from './content';
import { cmsUrl, cmsKey, cmsConfigured } from './cms-config';
import { validateEdits } from './editable-content';
import { safeHttps } from './integrations';
import './tickets-page.css';

if (cmsConfigured) {
  try {
    const response = await fetch(`${cmsUrl}/rest/v1/site_content?slug=eq.main&select=content`, {headers:{apikey:cmsKey},signal:AbortSignal.timeout(5000),cache:'no-store'});
    if (!response.ok) throw new Error('Unavailable');
    const rows=await response.json();
    if(rows[0]) Object.assign(c,validateEdits(rows[0].content));
  } catch { /* Use the bundled event configuration if the public CMS is unavailable. */ }
}
const ticketUrl=safeHttps(c.tickets.url,['bilietai.lt'])||'https://www.bilietai.lt/';
createRoot(document.getElementById('root')).render(<><header className="tickets-header"><a href="/" aria-label="Magiškas Miškas — pagrindinis puslapis"><img src="/brand/logo.png" alt="Magiškas Miškas"/></a><span>Tavo vakaras miške</span></header><main className="tickets-main"><h1>Bilietai į Magišką Mišką</h1><TicketWidget widgetId={c.tickets.widgetId} transparent/><a className="tickets-direct" href={ticketUrl} target="_blank" rel="noopener noreferrer">Atidaryti renginį Bilietai.lt</a></main><footer className="tickets-footer"><a href="/">Grįžti į Magišką Mišką</a><a href="tel:+37069906696">+370 699 06696</a></footer></>);
