import { ArrowIcon } from './ArrowIcon';
import { ui, locale, languageUrl } from './locale';
import { Partners } from './Partners';
import React, { useEffect, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { content as c } from './content';
import { safeHttps } from './integrations';
import { Instagram } from './Instagram';
import { SocialLink } from './SocialLink';
import { HeroVideo } from './HeroVideo';
import { MagicAtmosphere } from './MagicAtmosphere';
import { ContinuousBackground } from './ContinuousBackground';
import { AnimatedBrand } from './AnimatedBrand';
import { MonogramIntro } from './MonogramIntro';
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
  if (closed) return <a className={`button ticket-cta ${className}`} href="#bilietai">{c.copy.closedButton} <span aria-hidden="true"><ArrowIcon /></span></a>;
  return ticketUrl && !c.tickets.widgetId ? <External className={`button ticket-cta ${className}`} href={ticketUrl}>{children}<span aria-hidden="true"><ArrowIcon /></span></External> : <a className={`button ticket-cta ${className}`} href="#bilietai" onClick={() => window.dispatchEvent(new Event('open-ticket-selection'))}>{children}<span aria-hidden="true"><ArrowIcon /></span></a>;
}
function Brand({ watermark = false }) {
  if (watermark) return brand.logo ? <img className="watermark" src="/brand/symbol.png" alt="" aria-hidden="true" /> : null;
  return brand.logo ? <img className="brand-image" src={brand.logo} alt={c.name} /> : <span className="brand-text">MAGIŠKAS<br />MIŠKAS</span>;
}
function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => { const close = e => { if (e.key === 'Escape') { setOpen(false); document.getElementById('menu-toggle')?.focus(); } }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, []);
  return <header className="header"><a className="brand" href="#pradzia" aria-label={ui('Magiškas Miškas — pradžia','Magiškas Miškas — home')}><AnimatedBrand src={brand.logo} name={c.name} /></a>
    <button id="menu-toggle" className="menu-toggle" aria-controls="navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? ui('Uždaryti −','Close −') : ui('Meniu +','Menu +')}</button>
    <nav id="navigation" aria-label={ui('Pagrindinė navigacija','Main navigation')} className={open ? 'navigation open' : 'navigation'} onClick={() => setOpen(false)}>
      <a href="#kelione">{c.copy.navJourney}</a><a href="#atvykimas">{c.copy.navArrival}</a><a href="#duk">{c.copy.navFaq}</a><TicketLink />
    </nav><div className="language-switch" role="group" aria-label={ui('Svetainės kalba','Website language')}>{['lt','en'].map(lang=><a key={lang} href={languageUrl(lang,location.search,location.hash)} lang={lang} hrefLang={lang} aria-label={lang==='lt'?'Lietuvių':'English'} aria-current={locale===lang?'true':undefined} onClick={event=>{if(lang===locale){event.preventDefault();return;}try{sessionStorage.setItem('mm-intro-seen-v2','1');}catch{} const section=[...document.querySelectorAll('main section[id]')].filter(node=>node.getBoundingClientRect().top < innerHeight*.5).at(-1);event.currentTarget.href=languageUrl(lang,location.search,location.hash || (section?.id&&section.id!=='pradzia'?'#'+section.id:''));}}>{lang.toUpperCase()}</a>)}</div><div className="header-socials" role="group" aria-label={ui('Socialiniai tinklai','Social media')}><SocialLink network="instagram" href={c.instagram.profileUrl} /><SocialLink network="facebook" href={c.socials.facebook} /><SocialLink network="tiktok" href={c.socials.tiktok} /></div></header>;
}
function Journey() {
  const [active, setActive] = useState(0);
  useEffect(() => { window.dispatchEvent(new CustomEvent('forest-zone', { detail:c.journey[active]?.id })); }, [active]);
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
      <div className="journey-tabs" role="tablist" aria-label={ui('Miško erdvės','Forest spaces')}>
        {c.journey.map((zone, i) => <button key={zone.id} id={`tab-${zone.id}`} role="tab" aria-selected={active === i} aria-controls={zone.id} tabIndex={active === i ? 0 : -1} onClick={() => choose(i)} onKeyDown={event => onKeyDown(event, i)}>{zone.title}<span aria-hidden="true"><ArrowIcon direction="out" /></span></button>)}
      </div>
      <div className="journey-stage">
        {c.journey.map((zone, i) => <article key={zone.id} id={zone.id} role="tabpanel" aria-labelledby={`tab-${zone.id}`} tabIndex="0" hidden={active !== i} className="journey-scene">
          <div className="scene-content"><span className="eyebrow">{zone.cue}</span><h3>{zone.title}</h3><p>{zone.text}</p><span className="small-note">{zone.detail}</span></div>
          <img className="scene-symbol" src="/brand/symbol.png" alt="" aria-hidden="true" />
        </article>)}
        <div className="journey-controls"><span className="small-note">{c.copy.journeyNext}</span><div><button aria-label={ui('Ankstesnė erdvė','Previous space')} onClick={() => choose(active - 1)}><ArrowIcon direction="left" /></button><button aria-label={ui('Kita erdvė','Next space')} onClick={() => choose(active + 1)}><ArrowIcon direction="right" /></button></div></div>
      </div>
    </div>
  </section>;
}
function Faq() {
  const [expanded, setExpanded] = useState(false);
  const question = ([title, answer]) => <details key={title}><summary>{title}<span aria-hidden="true">+</span></summary><p>{answer}{title === c.faq[5]?.[0] && <span className="faq-ticket"><TicketLink /></span>}</p></details>;
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
    {onDemand && <div className="ticket-open-controls"><button className="button" aria-expanded={load} aria-controls="ticket-selection" onClick={() => { setOpened(true); setLoad(!load); }}>{load ? ui('Uždaryti bilietų pasirinkimą','Close ticket selection') : ui('Rinktis bilietus','Choose tickets')}<span aria-hidden="true">{load ? '−' : <ArrowIcon />}</span></button>{load && <p className="small-note">{ui('Bilietų lange slenkamas jo turinys. Uždarius pasirinkimą, toliau slinks visas puslapis.','Scroll within the ticket window to browse tickets. Close it to continue scrolling the page.')}</p>}</div>}
    <div id="ticket-selection" className="ticket-widget-panel" hidden={onDemand && !load}>{(!onDemand || opened) && <TicketWidget widgetId={c.tickets.widgetId} transparent={onDemand} />}</div>
    <External className="text-link ticket-direct" href={ticketUrl}>{c.copy.ticketsDirect} <ArrowIcon direction="out" /></External>
  </section>;
  return <section id="bilietai" className="section tickets"><div><span className="eyebrow">{c.copy.ticketsLabel}</span><h2 style={{whiteSpace:"pre-line"}}>{c.copy.ticketsTitle}</h2><p>{c.tickets.price}</p><ul className="ticket-types">{c.ticketTypes.map(type => <li key={type}>{type}</li>)}</ul></div><div className="ticket-panel"><span className="eyebrow">Magiškas Miškas × Bilietai.lt</span>
    {ticketFrame && load ? <iframe title={ui('Magiško Miško bilietai','Magiškas Miškas tickets')} src={ticketFrame} className="ticket-frame" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /> : <><p className="ticket-title">{ticketUrl ? ui('Iki miško — vienas žingsnis.','One step away from the forest.') : ui('Susitikime, kai miškas pabus.','Meet us when the forest awakens.')}</p><p>{ticketUrl ? ui('Pasirink savo apsilankymą Bilietai.lt.','Choose your visit on Bilietai.lt.') : ui('Bilietų prekybos pradžią ir visą lankymo kalendorių paskelbsime netrukus.','Ticket sales and the visiting calendar will be announced soon.')}</p>{ticketFrame && <button className="button outline" onClick={() => setLoad(true)}>Rodyti bilietų pasirinkimą <span><ArrowIcon direction="out" /></span></button>}</>}
    <External className="button" href={ticketUrl || safeHttps(c.tickets.fallbackUrl, ['bilietai.lt'])}>{ticketUrl ? c.copy.buy : ui('Atidaryti Bilietai.lt','Open Bilietai.lt')}<span aria-hidden="true"><ArrowIcon direction="out" /></span></External>{!ticketUrl && <span className="small-note">{ui('Renginio bilietų nuoroda dar nepaskelbta.','The event ticket link is not yet available.')}</span>}
  </div></section>;
}
function Arrival() {
  const mapUrl = safeHttps(c.map.embedUrl, ['google.com']);
  return <section id="atvykimas" className="section arrival"><div className="section-heading"><span className="eyebrow">{c.copy.navArrival}</span><h2 style={{whiteSpace:"pre-line"}}>{c.copy.arrivalTitle}</h2></div><div className="arrival-grid"><div className="transport">{c.transport.map(([title, text, link]) => <div key={title}><h3>{title}</h3><p>{text}</p>{safeHttps(link) && <External className="text-link" href={link}>{c.copy.planTrip} <ArrowIcon direction="out" /></External>}</div>)}</div><div className="map-panel"><span className="eyebrow">{c.copy.mapLabel}</span><p className="map-address">{c.venue}</p><p>{c.address}</p><External className="text-link" href={safeHttps(c.map.directionsUrl)}>{c.copy.directions} <ArrowIcon direction="out" /></External>{mapUrl && <><iframe title={ui('Magiško Miško atvykimo žemėlapis','Directions to Magiškas Miškas')} src={mapUrl} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /><External className="text-link" href={mapUrl}>{c.copy.openMap} <ArrowIcon direction="out" /></External></>}</div></div></section>;
}
function App() {
  useAmbientMotion();
  useEffect(()=>{if(location.hash){requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({behavior:'instant'}));}},[]);
  const params = new URLSearchParams(window.location.search);
  const localPreview = ['localhost','127.0.0.1'].includes(location.hostname);
  const preview = localPreview && params.get('perziura') === '1';
  const trailerPreview = localPreview && params.get('video') === '1';
  const continuousPreview = true;
  const introPreview = true;
  const [introDone, setIntroDone] = useState(() => { try { return sessionStorage.getItem('mm-intro-seen-v2') === '1'; } catch { return false; } });
  const finishIntro = useCallback(() => { try { sessionStorage.setItem('mm-intro-seen-v2','1'); } catch {} setIntroDone(true); }, []);
  const [videoOpen, setVideoOpen] = useState(false);
  const [background, setBackground] = useState(preview && params.get('fonas') === 'nuotrauka' ? 'photo' : c.appearance.background);
  const switchBackground = value => {
    setBackground(value);
    const url = new URL(window.location.href);
    url.searchParams.set('fonas', value === 'photo' ? 'nuotrauka' : 'spalvos');
    window.history.replaceState(null, '', url);
  };
  return <div className={`immersive-preview${introPreview ? " intro-experience" : ""}${introPreview && !introDone ? " intro-running" : ""}`}>{introPreview && <MonogramIntro onDone={finishIntro} finished={introDone} />}{continuousPreview && <ContinuousBackground />}<a className="skip-link" href="#turinys">{ui('Pereiti prie turinio','Skip to content')}</a><Header />{preview && <div className="background-preview" role="group" aria-label={ui('Fono variantų peržiūra','Background preview')}><span>{ui('Fono peržiūra','Background preview')}</span><button aria-pressed={background === 'colors'} onClick={() => switchBackground('colors')}>{ui('Spalvos','Colours')}</button><button aria-pressed={background === 'photo'} onClick={() => switchBackground('photo')}>{ui('Nuotrauka','Photo')}</button></div>}<main id="turinys">
    <section id="pradzia" className={`hero hero-${background} ${trailerPreview ? 'has-trailer' : ''}`}>{background === 'photo' && <img className="hero-photo" src="/images/forest-night.webp" alt="" aria-hidden="true" fetchPriority="high" />}<MagicAtmosphere /><Brand watermark /><div className="hero-meta eyebrow"><span>{c.copy.heroLabel}</span><span>{c.city} / {c.copy.heroLocation}</span></div><div className="hero-title"><span className="eyebrow">{c.tagline}</span><h1 aria-label={introPreview ? `${c.copy.heroFirst} ${c.copy.heroSecond}` : undefined}><span aria-hidden={introPreview || undefined}>{introPreview && !introDone ? [...c.copy.heroFirst].map((letter,i)=><span className="intro-letter" key={i}>{letter === ' ' ? '\u00a0' : letter}</span>) : c.copy.heroFirst}</span><span aria-hidden={introPreview || undefined}>{introPreview && !introDone ? [...c.copy.heroSecond].map((letter,i)=><span className="intro-letter" key={i}>{letter === ' ' ? '\u00a0' : letter}</span>) : c.copy.heroSecond}</span></h1></div><div className="hero-bottom"><p>{c.description}</p><div className="hero-date"><span>{c.city}</span><span className="small-note">{closed ? c.season.closedMessage : c.date}</span></div><a className="enter-link" href="#slenkstis">{c.copy.enter} <span aria-hidden="true"><ArrowIcon direction="down" /></span></a></div><div className="hero-ticket"><TicketLink />{trailerPreview && <button className="hero-watch" onClick={() => setVideoOpen(true)} aria-haspopup="dialog"><span className="hero-play" aria-hidden="true">▶</span><span>{ui('Pajusk magiją','Feel the magic')}<small>{ui('Žiūrėti filmą · 1 min.','Watch the film · 1 min.')}</small></span></button>}</div></section>
    {videoOpen && <HeroVideo onClose={() => setVideoOpen(false)} />}
    <section id="slenkstis" className="pause section"><Brand watermark /><span className="eyebrow">{c.copy.pauseLabel}</span><h2>{c.pause}</h2><p className="pause-story">{c.story}</p><span className="pause-bottom eyebrow">{c.copy.pauseBottom}</span></section>
    <Instagram />
    <section className="section overview" aria-labelledby="trumpai"><div><h2 id="trumpai" style={{whiteSpace:"pre-line"}}>{c.copy.overviewTitle}</h2></div><dl>{[[c.copy.experienceLabel, c.copy.experience], [c.copy.durationLabel, c.duration], [c.copy.audienceLabel, c.copy.audience], [c.copy.venueLabel, c.venue]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
    <Journey /><Tickets />
    <section id="informacija" className="section practical"><div className="section-heading"><span className="eyebrow">{c.copy.practicalLabel}</span><h2 style={{whiteSpace:"pre-line"}}>{c.copy.practicalTitle}</h2></div><dl>{[[c.copy.whenLabel, `${c.date.replace(/\.$/, '')}. ${c.hours.replace(/\.$/, '')}.`], [c.copy.whereLabel, `${c.venue}. ${c.address}.`], [c.copy.durationLabel, c.duration], ...c.practical].map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><div className="practical-cta"><TicketLink /></div></section>
    <Arrival /><Faq /><Partners />
    <section className="final section"><Brand watermark /><span className="eyebrow">{c.tagline}</span><h2>{closed ? c.season.closedMessage : <>{c.final.first}<br /><span>{c.final.second}</span></>}</h2><TicketLink /><p>{c.city} · {c.date}</p></section>
  </main><footer><a className="brand" href="#pradzia"><Brand /></a><div className="footer-links"><SocialLink network="instagram" href={c.instagram.profileUrl} /><SocialLink network="facebook" href={c.socials.facebook} /><SocialLink network="tiktok" href={c.socials.tiktok} />{c.contactEmail && <a href={`mailto:${c.contactEmail}`}>{c.copy.contact} <ArrowIcon direction="out" /></a>}{safeHttps(c.reviewUrl) && <External href={c.reviewUrl}>{c.copy.review} <ArrowIcon direction="out" /></External>}</div><p>© {new Date().getFullYear()} {c.name}</p><a className="text-link" href="#pradzia">{c.copy.backTop} <ArrowIcon direction="up" /></a>{localPreview && params.get('intro') === '1' && introDone && <button className="intro-replay" onClick={() => { window.history.replaceState(null,"",window.location.pathname+window.location.search); window.scrollTo({top:0,behavior:"instant"}); setIntroDone(false); }}>{ui('Pakartoti įžangą','Replay introduction')} <ArrowIcon direction="replay" /></button>}</footer><div className="mobile-ticket"><TicketLink /></div></div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
