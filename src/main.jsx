import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { content as c } from './content';
import { safeHttps } from './integrations';
import { Instagram } from './Instagram';
import { SocialLink } from './SocialLink';
import { MagicAtmosphere } from './MagicAtmosphere';
import { ContinuousBackground } from './ContinuousBackground';
import { AnimatedBrand } from './AnimatedBrand';
import { TicketWidget } from './TicketWidget';
import './styles.css';
import './headerSocials.css';
import { useAmbientMotion } from './useAmbientMotion';

const brand = __BRAND__;
const closed = c.season.mode === 'closed';
const ticketUrl = closed ? '' : safeHttps(c.tickets.url, ['bilietai.lt']);
const ticketFrame = safeHttps(c.tickets.iframeUrl, ['bilietai.lt']);
function External({ href, children, ...props }) { return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>; }
function TicketLink({ className = '', children = c.copy.buy }) {
  if (closed) return <a className={`button ${className}`} href="#bilietai">{c.copy.closedButton} <span aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" focusable="false" style={{display:'block'}}><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span></a>;
  return ticketUrl && !c.tickets.widgetId ? <External className={`button ${className}`} href={ticketUrl}>{children}<span aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" focusable="false" style={{display:'block'}}><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span></External> : <a className={`button ${className}`} href="#bilietai" onClick={() => window.dispatchEvent(new Event('open-ticket-selection'))}>{children}<span aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" focusable="false" style={{display:'block'}}><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span></a>;
}
function Brand({ watermark = false }) {
  if (watermark) return brand.logo ? <img className="watermark" src="brand/symbol.png" alt="" aria-hidden="true" /> : null;
  return brand.logo ? <img className="brand-image" src={brand.logo} alt={c.name} /> : <span className="brand-text">MAGIŠKAS<br />MIŠKAS</span>;
}
function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => { const close = e => { if (e.key === 'Escape') { setOpen(false); document.getElementById('menu-toggle')?.focus(); } }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, []);
  return <header className="header"><a className="brand" href="#pradzia" aria-label="Magiškas Miškas — pradžia"><AnimatedBrand src={brand.logo} name={c.name} /></a>
    <button id="menu-toggle" className="menu-toggle" aria-controls="navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Uždaryti −' : 'Meniu +'}</button>
    <nav id="navigation" aria-label="Pagrindinė navigacija" className={open ? 'navigation open' : 'navigation'} onClick={() => setOpen(false)}>
      <a href="#kelione">{c.copy.navJourney}</a><a href="#atvykimas">{c.copy.navArrival}</a><a href="#duk">{c.copy.navFaq}</a><TicketLink />
    </nav><div className="header-socials" role="group" aria-label="Socialiniai tinklai"><SocialLink network="instagram" href={c.instagram.profileUrl} /><SocialLink network="facebook" href={c.socials.facebook} /><SocialLink network="tiktok" href={c.socials.tiktok} /></div></header>;
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
    <div className="section-heading"><span className="eyebrow">{c.copy.navJourney}</span><h2 style={{whiteSpace:"pre-line"}}>{c.copy.journeyTitle}</h2><p>{c.copy.journeyIntro}</p></div>
    <div className="journey-explorer">
      <div className="journey-tabs" role="tablist" aria-label="Miško erdvės">
        {c.journey.map((zone, i) => <button key={zone.id} id={`tab-${zone.id}`} role="tab" aria-selected={active === i} aria-controls={zone.id} tabIndex={active === i ? 0 : -1} onClick={() => choose(i)} onKeyDown={event => onKeyDown(event, i)}>{zone.title}<span aria-hidden="true">↗</span></button>)}
      </div>
      <div className="journey-stage">
        {c.journey.map((zone, i) => <article key={zone.id} id={zone.id} role="tabpanel" aria-labelledby={`tab-${zone.id}`} tabIndex="0" hidden={active !== i} className="journey-scene">
          <div className="scene-content"><span className="eyebrow">{zone.cue}</span><h3>{zone.title}</h3><p>{zone.text}</p><span className="small-note">{zone.detail}</span></div>
          <img className="scene-symbol" src="brand/symbol.png" alt="" aria-hidden="true" />
        </article>)}
        <div className="journey-controls"><span className="small-note">{c.copy.journeyNext}</span><div><button aria-label="Ankstesnė erdvė" onClick={() => choose(active - 1)}>←</button><button aria-label="Kita erdvė" onClick={() => choose(active + 1)}>→</button></div></div>
      </div>
    </div>
  </section>;
}
function Faq() {
  const [expanded, setExpanded] = useState(false);
  const question = ([title, answer]) => <details key={title}><summary>{title}<span aria-hidden="true">+</span></summary><p>{answer}{title === 'Kaip įsigyti bilietą?' && <span className="faq-ticket"><TicketLink /></span>}</p></details>;
  return <section id="duk" className="section faq"><div><span className="eyebrow">{c.copy.navFaq}</span><h2 style={{whiteSpace:"pre-line"}}>{c.copy.faqTitle}</h2></div><div>{c.faq.slice(0, 6).map(question)}<div id="more-questions" hidden={!expanded}>{c.faq.slice(6).map(question)}</div>{c.faq.length > 6 && <button className="text-link faq-more" aria-expanded={expanded} aria-controls="more-questions" onClick={() => setExpanded(!expanded)}>{expanded ? c.copy.faqLess : c.copy.faqMore}</button>}</div></section>;
}
function Tickets() {
  const [load, setLoad] = useState(false);
  const [opened, setOpened] = useState(false);
  const onDemand = true;
  useEffect(() => {
    const open = () => { setOpened(true); setLoad(true); };
    window.addEventListener('open-ticket-selection', open);
    return () => window.removeEventListener('open-ticket-selection', open);
  }, []);
  if (closed) return <section id="bilietai" className="section tickets"><h2>{c.season.closedMessage}</h2><p>{c.copy.closedIntro}</p></section>;
  if (c.tickets.widgetId) return <section id="bilietai" className="section tickets tickets-integrated">
    <div className="section-heading"><span className="eyebrow">{c.copy.ticketsLabel}</span><h2 style={{whiteSpace:"pre-line"}}>{c.copy.ticketsTitle}</h2><p>{c.copy.ticketsIntro}</p></div>
    {onDemand && <div className="ticket-open-controls"><button className="button" aria-expanded={load} aria-controls="ticket-selection" onClick={() => { setOpened(true); setLoad(!load); }}>{load ? 'Uždaryti bilietų pasirinkimą' : 'Rinktis bilietus'}<span aria-hidden="true">{load ? '−' : '↗'}</span></button>{load && <p className="small-note">Bilietų lange slenkamas jo turinys. Uždarius pasirinkimą, toliau slinks visas puslapis.</p>}</div>}
    <div id="ticket-selection" className="ticket-widget-panel" hidden={onDemand && !load}>{(!onDemand || opened) && <TicketWidget widgetId={c.tickets.widgetId} transparent={onDemand} />}</div>
    <External className="text-link ticket-direct" href={ticketUrl}>{c.copy.ticketsDirect} ↗</External>
  </section>;
  return <section id="bilietai" className="section tickets"><div><span className="eyebrow">{c.copy.ticketsLabel}</span><h2 style={{whiteSpace:"pre-line"}}>{c.copy.ticketsTitle}</h2><p>{c.tickets.price}</p><ul className="ticket-types">{c.ticketTypes.map(type => <li key={type}>{type}</li>)}</ul></div><div className="ticket-panel"><span className="eyebrow">Magiškas Miškas × Bilietai.lt</span>
    {ticketFrame && load ? <iframe title="Magiško Miško bilietai" src={ticketFrame} className="ticket-frame" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /> : <><p className="ticket-title">{ticketUrl ? 'Iki miško — vienas žingsnis.' : 'Susitikime, kai miškas pabus.'}</p><p>{ticketUrl ? 'Pasirink savo apsilankymą Bilietai.lt.' : 'Bilietų prekybos pradžią ir visą lankymo kalendorių paskelbsime netrukus.'}</p>{ticketFrame && <button className="button outline" onClick={() => setLoad(true)}>Rodyti bilietų pasirinkimą <span>↗</span></button>}</>}
    <External className="button" href={ticketUrl || safeHttps(c.tickets.fallbackUrl, ['bilietai.lt'])}>{ticketUrl ? c.copy.buy : 'Atidaryti Bilietai.lt'}<span aria-hidden="true">↗</span></External>{!ticketUrl && <span className="small-note">Renginio bilietų nuoroda dar nepaskelbta.</span>}
  </div></section>;
}
function Arrival() {
  const mapUrl = safeHttps(c.map.embedUrl, ['google.com']);
  return <section id="atvykimas" className="section arrival"><div className="section-heading"><span className="eyebrow">{c.copy.navArrival}</span><h2 style={{whiteSpace:"pre-line"}}>{c.copy.arrivalTitle}</h2></div><div className="arrival-grid"><div className="transport">{c.transport.map(([title, text, link]) => <div key={title}><h3>{title}</h3><p>{text}</p>{safeHttps(link) && <External className="text-link" href={link}>{c.copy.planTrip} ↗</External>}</div>)}</div><div className="map-panel"><span className="eyebrow">{c.copy.mapLabel}</span><p className="map-address">{c.venue}</p><p>{c.address}</p><External className="text-link" href={safeHttps(c.map.directionsUrl)}>{c.copy.directions} ↗</External>{mapUrl && <><iframe title="Magiško Miško atvykimo žemėlapis" src={mapUrl} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /><External className="text-link" href={mapUrl}>{c.copy.openMap} ↗</External></>}</div></div></section>;
}
function App() {
  useAmbientMotion();
  const params = new URLSearchParams(window.location.search);
  const preview = params.get('perziura') === '1';
  const [background, setBackground] = useState(preview && params.get('fonas') === 'nuotrauka' ? 'photo' : c.appearance.background);
  const switchBackground = value => {
    setBackground(value);
    const url = new URL(window.location.href);
    url.searchParams.set('fonas', value === 'photo' ? 'nuotrauka' : 'spalvos');
    window.history.replaceState(null, '', url);
  };
  return <div className="immersive-preview"><ContinuousBackground /><a className="skip-link" href="#turinys">Pereiti prie turinio</a><Header />{preview && <div className="background-preview" role="group" aria-label="Fono variantų peržiūra"><span>Fono peržiūra</span><button aria-pressed={background === 'colors'} onClick={() => switchBackground('colors')}>Spalvos</button><button aria-pressed={background === 'photo'} onClick={() => switchBackground('photo')}>Nuotrauka</button></div>}<main id="turinys">
    <section id="pradzia" className={`hero hero-${background}`}>{background === 'photo' && <img className="hero-photo" src="images/forest-night.webp" alt="" aria-hidden="true" fetchPriority="high" />}<MagicAtmosphere /><Brand watermark /><div className="hero-meta eyebrow"><span>{c.copy.heroLabel}</span><span>{c.city} / {c.copy.heroLocation}</span></div><div className="hero-title"><span className="eyebrow">{c.tagline}</span><h1><span>{c.copy.heroFirst}</span><span>{c.copy.heroSecond}</span></h1></div><div className="hero-bottom"><p>{c.description}</p><div className="hero-date"><span>{c.city}</span><span className="small-note">{closed ? c.season.closedMessage : c.date}</span></div><a className="enter-link" href="#slenkstis">{c.copy.enter} <span aria-hidden="true">↓</span></a></div><div className="hero-ticket"><TicketLink /></div></section>
    <section id="slenkstis" className="pause section"><Brand watermark /><span className="eyebrow">{c.copy.pauseLabel}</span><h2>{c.pause}</h2><p className="pause-story">{c.story}</p><span className="pause-bottom eyebrow">{c.copy.pauseBottom}</span></section>
    <Instagram />
    <section className="section overview" aria-labelledby="trumpai"><div><h2 id="trumpai" style={{whiteSpace:"pre-line"}}>{c.copy.overviewTitle}</h2></div><dl>{[[c.copy.experienceLabel, c.copy.experience], [c.copy.durationLabel, c.duration], [c.copy.audienceLabel, c.copy.audience], [c.copy.venueLabel, c.venue]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
    <Journey /><Tickets />
    <section id="informacija" className="section practical"><div className="section-heading"><span className="eyebrow">{c.copy.practicalLabel}</span><h2 style={{whiteSpace:"pre-line"}}>{c.copy.practicalTitle}</h2></div><dl>{[[c.copy.whenLabel, `${c.date.replace(/\.$/, '')}. ${c.hours.replace(/\.$/, '')}.`], [c.copy.whereLabel, `${c.venue}. ${c.address}.`], [c.copy.durationLabel, c.duration], ...c.practical].map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><div className="practical-cta"><TicketLink /></div></section>
    <Arrival /><Faq />
    <section className="final section"><Brand watermark /><span className="eyebrow">{c.tagline}</span><h2>{closed ? c.season.closedMessage : <>{c.final.first}<br /><span>{c.final.second}</span></>}</h2><TicketLink /><p>{c.city} · {c.date}</p></section>
  </main><footer><a className="brand" href="#pradzia"><Brand /></a><div className="footer-links"><SocialLink network="instagram" href={c.instagram.profileUrl} /><SocialLink network="facebook" href={c.socials.facebook} /><SocialLink network="tiktok" href={c.socials.tiktok} />{c.contactEmail && <a href={`mailto:${c.contactEmail}`}>{c.copy.contact} ↗</a>}{safeHttps(c.reviewUrl) && <External href={c.reviewUrl}>{c.copy.review} ↗</External>}</div><p>© {new Date().getFullYear()} {c.name}</p><a className="text-link" href="#pradzia">{c.copy.backTop} ↑</a></footer><div className="mobile-ticket"><TicketLink /></div></div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

