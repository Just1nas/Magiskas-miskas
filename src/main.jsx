import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { content as c } from './content';
import { safeHttps, normalizePosts } from './integrations';
import './styles.css';
import { useAmbientMotion } from './useAmbientMotion';

const brand = __BRAND__;
const closed = c.season.mode === 'closed';
const ticketUrl = closed ? '' : safeHttps(c.tickets.url, ['bilietai.lt']);
const ticketFrame = safeHttps(c.tickets.iframeUrl, ['bilietai.lt']);
const instagramUrl = safeHttps(c.instagram.profileUrl, ['instagram.com']);
function External({ href, children, ...props }) { return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>; }
function TicketLink({ className = '', children = 'Pirkti bilietą' }) {
  if (closed) return <a className={`button ${className}`} href="#bilietai">Iki susitikimo <span aria-hidden="true">↗</span></a>;
  return ticketUrl ? <External className={`button ${className}`} href={ticketUrl}>{children}<span aria-hidden="true">↗</span></External> : <a className={`button ${className}`} href="#bilietai">{children}<span aria-hidden="true">↗</span></a>;
}
function Brand({ watermark = false }) {
  if (watermark) return brand.logo ? <img className="watermark" src="brand/symbol.png" alt="" aria-hidden="true" /> : null;
  return brand.logo ? <img className="brand-image" src={brand.logo} alt={c.name} /> : <span className="brand-text">MAGIŠKAS<br />MIŠKAS</span>;
}
function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => { const close = e => { if (e.key === 'Escape') { setOpen(false); document.getElementById('menu-toggle')?.focus(); } }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, []);
  return <header className="header"><a className="brand" href="#pradzia" aria-label="Magiškas Miškas — pradžia"><Brand /></a>
    <button id="menu-toggle" className="menu-toggle" aria-controls="navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Uždaryti −' : 'Meniu +'}</button>
    <nav id="navigation" aria-label="Pagrindinė navigacija" className={open ? 'navigation open' : 'navigation'} onClick={() => setOpen(false)}>
      <a href="#kelione">Kas laukia?</a><a href="#atvykimas">Kaip atvykti</a><a href="#duk">D.U.K.</a><TicketLink />
    </nav></header>;
}
function Journey() {
  const [active, setActive] = useState(0);
  const choose = index => setActive((index + c.journey.length) % c.journey.length);
  const onKeyDown = (event, index) => {
    const keys = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: c.journey.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = (keys[event.key] + c.journey.length) % c.journey.length;
    choose(next);
    document.getElementById(`tab-${c.journey[next].id}`)?.focus();
  };
  return <section id="kelione" className="journey section">
    <div className="section-heading"><span className="eyebrow">Kas laukia?</span><h2>Penkios erdvės.<br />Viena kelionė.</h2><p>Pasirink, kur nori nuklysti.</p></div>
    <div className="journey-explorer">
      <div className="journey-tabs" role="tablist" aria-label="Miško erdvės">
        {c.journey.map((zone, i) => <button key={zone.id} id={`tab-${zone.id}`} role="tab" aria-selected={active === i} aria-controls={zone.id} tabIndex={active === i ? 0 : -1} onClick={() => choose(i)} onKeyDown={event => onKeyDown(event, i)}>{zone.title}<span aria-hidden="true">↗</span></button>)}
      </div>
      <div className="journey-stage">
        {c.journey.map((zone, i) => <article key={zone.id} id={zone.id} role="tabpanel" aria-labelledby={`tab-${zone.id}`} tabIndex="0" hidden={active !== i} className="journey-scene">
          <div className="scene-content"><span className="eyebrow">{zone.cue}</span><h3>{zone.title}</h3><p>{zone.text}</p><span className="small-note">{zone.detail}</span></div>
          <img className="scene-symbol" src="brand/symbol.png" alt="" aria-hidden="true" />
        </article>)}
        <div className="journey-controls"><span className="small-note">Toliau — dar viena paslaptis.</span><div><button aria-label="Ankstesnė erdvė" onClick={() => choose(active - 1)}>←</button><button aria-label="Kita erdvė" onClick={() => choose(active + 1)}>→</button></div></div>
      </div>
    </div>
  </section>;
}
function Faq() {
  const [expanded, setExpanded] = useState(false);
  const question = ([title, answer]) => <details key={title}><summary>{title}<span aria-hidden="true">+</span></summary><p>{answer}{title === 'Kaip įsigyti bilietą?' && <span className="faq-ticket"><TicketLink /></span>}</p></details>;
  return <section id="duk" className="section faq"><div><span className="eyebrow">D.U.K.</span><h2>Smalsu?<br />Puiku.</h2></div><div>{c.faq.slice(0, 6).map(question)}<div id="more-questions" hidden={!expanded}>{c.faq.slice(6).map(question)}</div>{c.faq.length > 6 && <button className="text-link faq-more" aria-expanded={expanded} aria-controls="more-questions" onClick={() => setExpanded(!expanded)}>{expanded ? 'Rodyti mažiau −' : 'Daugiau klausimų +'}</button>}</div></section>;
}
function Tickets() {
  const [load, setLoad] = useState(false);
  if (closed) return <section id="bilietai" className="section tickets"><h2>{c.season.closedMessage}</h2><p>Sek naujienas. Apie kitą kelionę pranešime čia.</p></section>;
  return <section id="bilietai" className="section tickets"><div><span className="eyebrow">Tavo vakaras miške</span><h2>Nuostaba<br />laukia tavęs.</h2><p>{c.tickets.price}</p><ul className="ticket-types">{c.ticketTypes.map(type => <li key={type}>{type}</li>)}</ul></div><div className="ticket-panel"><span className="eyebrow">Magiškas Miškas × Bilietai.lt</span>
    {ticketFrame && load ? <iframe title="Magiško Miško bilietai" src={ticketFrame} className="ticket-frame" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /> : <><p className="ticket-title">{ticketUrl ? 'Iki miško — vienas žingsnis.' : 'Susitikime, kai miškas pabus.'}</p><p>{ticketUrl ? 'Pasirink savo apsilankymą Bilietai.lt.' : 'Bilietų prekybos pradžią ir visą lankymo kalendorių paskelbsime netrukus.'}</p>{ticketFrame && <button className="button outline" onClick={() => setLoad(true)}>Rodyti bilietų pasirinkimą <span>↗</span></button>}</>}
    <External className="button" href={ticketUrl || safeHttps(c.tickets.fallbackUrl, ['bilietai.lt'])}>{ticketUrl ? 'Pirkti bilietą' : 'Atidaryti Bilietai.lt'}<span aria-hidden="true">↗</span></External>{!ticketUrl && <span className="small-note">Renginio bilietų nuoroda dar nepaskelbta.</span>}
  </div></section>;
}
function Arrival() {
  const [mapOpen, setMapOpen] = useState(false);
  const mapUrl = safeHttps(c.map.embedUrl, ['google.com']);
  return <section id="atvykimas" className="section arrival"><div className="section-heading"><span className="eyebrow">Kaip atvykti</span><h2>Visi keliai<br />veda į mišką.</h2></div><div className="arrival-grid"><div className="transport">{c.transport.map(([title, text, link]) => <div key={title}><h3>{title}</h3><p>{text}</p>{safeHttps(link) && <External className="text-link" href={link}>Planuoti kelionę ↗</External>}</div>)}</div><div className="map-panel"><span className="eyebrow">Vilnius / Vingis</span><p className="map-address">{c.venue}</p><p>{c.address}</p><External className="text-link" href={safeHttps(c.map.directionsUrl)}>Atidaryti maršrutą ↗</External>{mapUrl && (mapOpen ? <iframe title="Renginio vieta žemėlapyje" src={mapUrl} loading="lazy" referrerPolicy="no-referrer" /> : <button className="text-link" onClick={() => setMapOpen(true)}>Rodyti Google žemėlapį +</button>)}</div></div></section>;
}
function Instagram() {
  const [posts, setPosts] = useState([]);
  const [state, setState] = useState('idle');
  useEffect(() => {
    const endpoint = c.instagram.endpoint;
    if (!endpoint || !(endpoint.startsWith('/') && !endpoint.startsWith('//') || safeHttps(endpoint))) return;
    let stopped = false, timer, controller;
    async function refresh() {
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      setState('loading');
      try {
        const response = await fetch(endpoint, { signal: controller.signal, credentials: 'omit' });
        if (!response.ok) throw new Error('Feed unavailable');
        const items = normalizePosts(await response.json(), c.instagram.limit);
        if (!stopped) { setPosts(items); setState('ready'); }
      } catch { if (!stopped) setState('error'); }
      finally { clearTimeout(timeout); if (!stopped) timer = setTimeout(refresh, Math.max(60000, c.instagram.refreshMs)); }
    }
    refresh(); return () => { stopped = true; clearTimeout(timer); controller?.abort(); };
  }, []);
  return <section id="instagram" className="section instagram"><div className="section-heading"><span className="eyebrow">Akimirkos</span><h2>Iš Magiško<br />Miško.</h2>{instagramUrl && <External className="text-link" href={instagramUrl}>Sekti Instagram ↗</External>}</div>
    {posts.length ? <div className="instagram-feed" role="region" aria-label="Naujausi Instagram įrašai" tabIndex="0">{posts.map(post => <External href={post.permalink} className="instagram-post" key={post.id}><span className="eyebrow">Instagram</span><p>{post.caption}</p><span className="post-bottom"><time dateTime={post.timestamp}>{new Date(post.timestamp).toLocaleDateString('lt-LT')}</time><span aria-hidden="true">↗</span></span></External>)}</div> : <div className="instagram-empty" role="status"><span className="eyebrow">Istorijos, kuriomis norisi dalintis</span><p>{state === 'loading' ? 'Ieškome naujausių akimirkų…' : state === 'error' ? 'Įrašų šiuo metu nepavyko įkelti.' : 'Pirmosios miško istorijos — jau netrukus.'}</p><span className="small-note">{instagramUrl ? 'Daugiau akimirkų rasi mūsų Instagram paskyroje.' : 'Čia atsiras naujausios mūsų Instagram istorijos.'}</span></div>}
  </section>;
}
function App() {
  useAmbientMotion();
  return <><a className="skip-link" href="#turinys">Pereiti prie turinio</a><Header /><main id="turinys">
    <section id="pradzia" className="hero"><Brand watermark /><div className="hero-meta eyebrow"><span>Patyrimų ir šviesos spektaklis</span><span>{c.city} / Po atviru dangumi</span></div><div className="hero-title"><span className="eyebrow">{c.tagline}</span><h1><span>Magiškas</span><span>Miškas</span></h1></div><div className="hero-bottom"><p>{c.description}</p><div className="hero-date"><span>{c.city}</span><span className="small-note">{closed ? c.season.closedMessage : c.date}</span></div><a className="enter-link" href="#slenkstis">Įžengti <span aria-hidden="true">↓</span></a></div><div className="hero-ticket"><TicketLink /></div></section>
    <section id="slenkstis" className="pause section"><Brand watermark /><span className="eyebrow">Palik kasdienybę už slenksčio</span><h2>{c.pause}</h2><p className="pause-story">{c.story}</p><span className="pause-bottom eyebrow">Ne tik pamatyti. Pajusti.</span></section>
    <section className="section overview" aria-labelledby="trumpai"><div><h2 id="trumpai">Trumpai<br />apie magiją.</h2></div><dl>{[['Patyrimas', 'Šviesos. Gamtos. Vaizduotės.'], ['Trukmė', c.duration], ['Kam?', 'Visokio ūgio vaikams'], ['Vieta', c.venue]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
    <Journey /><Tickets />
    <section id="informacija" className="section practical"><div className="section-heading"><span className="eyebrow">Prieš įžengiant</span><h2>Truputis planavimo.<br />Daugiau magijos.</h2></div><dl>{[['Kada', `${c.date.replace(/\.$/, '')}. ${c.hours.replace(/\.$/, '')}.`], ['Kur', `${c.venue}. ${c.address}.`], ['Trukmė', c.duration], ...c.practical].map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><div className="practical-cta"><TicketLink /></div></section>
    <Arrival /><Instagram /><Faq />
    <section className="final section"><Brand watermark /><span className="eyebrow">{c.tagline}</span><h2>{closed ? c.season.closedMessage : <>{c.final.first}<br /><span>{c.final.second}</span></>}</h2><TicketLink /><p>{c.city} · {c.date}</p></section>
  </main><footer><a className="brand" href="#pradzia"><Brand /></a><div className="footer-links">{instagramUrl && <External href={instagramUrl}>Instagram ↗</External>}{safeHttps(c.socials.facebook, ['facebook.com']) && <External href={c.socials.facebook}>Facebook ↗</External>}{safeHttps(c.socials.tiktok, ['tiktok.com']) && <External href={c.socials.tiktok}>TikTok ↗</External>}{c.contactEmail && <a href={`mailto:${c.contactEmail}`}>Susisiekime ↗</a>}{safeHttps(c.reviewUrl) && <External href={c.reviewUrl}>Palikti atsiliepimą ↗</External>}</div><p>© {new Date().getFullYear()} {c.name}</p><a className="text-link" href="#pradzia">Į pradžią ↑</a></footer><div className="mobile-ticket"><TicketLink /></div></>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
