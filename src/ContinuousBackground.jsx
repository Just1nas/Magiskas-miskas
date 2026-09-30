import React, { useEffect, useRef } from 'react';
import { MagicAtmosphere } from './MagicAtmosphere';
import { content } from './content';
import './continuousBackground.css';

// One decorative layer stays behind the whole document.
export function ContinuousBackground() {
  const root = useRef(null);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const sections = [...document.querySelectorAll('main > section')];
    const page = root.current.parentElement;
    const ticketPanel = document.querySelector('.ticket-widget-panel');
    const ticketObserver = ticketPanel && new IntersectionObserver(([entry]) => {
      page.classList.toggle('ticket-panel-visible', entry.isIntersecting);
    }, { rootMargin: '-94px 0px 0px 0px', threshold: 0 });
    if (ticketObserver) ticketObserver.observe(ticketPanel);
    const journey=document.querySelector('#kelione');
    const changeZone=event=>{ root.current.dataset.zone=event.detail; schedule(); };
    window.addEventListener('forest-zone',changeZone);
    root.current.dataset.zone=content.journey[0]?.id || '';
    const zoneObserver=journey && new IntersectionObserver(([entry])=>{
      root.current.style.setProperty('--zone-strength',entry.isIntersecting ? '.55' : '0');
    },{threshold:.15});
    if(zoneObserver) zoneObserver.observe(journey);
    let frame = 0;
    function update() {
      frame = 0;
      const still = media.matches || !content.appearance.motion;
      page.classList.toggle('ambient-paused', still || document.hidden);
      const focus = innerHeight * .48;
      const activeSection = sections.find(section => { const r=section.getBoundingClientRect(); return r.top<=focus && r.bottom>focus; });
      const palette = { pradzia:155, slenkstis:195, instagram:235, bilietai:165, atvykimas:130 };
      const zones = { 'snabzdesiu-aleja':130, 'prisiminimu-kudra':175, 'snaudziantis-rozynas':260, 'paslapciu-giraite':225, 'gardumynu-sodas':15 };
      const hue = activeSection?.id==='kelione' ? (zones[root.current.dataset.zone] ?? 155) : (palette[activeSection?.id] ?? 195);
      page.style.setProperty('--ambient-hue', `${still ? 155 : hue}deg`);
      let darkness = 0;
      if (!still) for (const section of sections) {
        if (section.matches('.hero,.pause,.final')) continue;
        const { top, bottom } = section.getBoundingClientRect();
        const fade = Math.min(innerHeight * .32, (bottom - top) / 2);
        const weight = Math.max(0, Math.min(1, (focus - top) / fade, (bottom - focus) / fade));
        darkness = Math.max(darkness, weight);
      }
      root.current.style.setProperty('--veil', still ? '.4' : String(darkness * .62));
      page.style.setProperty('--logo-opacity', still ? '.12' : String(.23 - darkness * .13));
      root.current.style.setProperty('--logo-opacity', still ? '.12' : String(.23 - darkness * .13));
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const layoutObserver = new ResizeObserver(schedule);
    sections.forEach(section => layoutObserver.observe(section));
    update();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    media.addEventListener('change', schedule);
    document.addEventListener('visibilitychange', schedule);
    return () => {
      zoneObserver?.disconnect();
      window.removeEventListener('forest-zone',changeZone);
      layoutObserver.disconnect();
      ticketObserver?.disconnect();
      page.classList.remove('ticket-panel-visible');
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      media.removeEventListener('change', schedule);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, []);
  return <div ref={root} className="continuous-background" aria-hidden="true">
    <div className="continuous-color" />
    <div className="zone-glow zone-blue" /><div className="zone-glow zone-violet" /><div className="zone-glow zone-gold" /><div className="zone-glow zone-green" />
    <MagicAtmosphere />
    <div className="continuous-veil" />
    <div className="continuous-logo-reveal"><img className="continuous-logo" src="/brand/symbol.png" alt="" /></div>
  </div>;
}
