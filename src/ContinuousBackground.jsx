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
    let frame = 0;
    function update() {
      frame = 0;
      const still = media.matches || !content.appearance.motion;
      const focus = innerHeight * .48;
      let darkness = 0;
      if (!still) for (const section of sections) {
        if (section.matches('.hero,.pause,.final')) continue;
        const { top, bottom } = section.getBoundingClientRect();
        const fade = Math.min(innerHeight * .32, (bottom - top) / 2);
        const weight = Math.max(0, Math.min(1, (focus - top) / fade, (bottom - focus) / fade));
        darkness = Math.max(darkness, weight);
      }
      root.current.style.setProperty('--veil', still ? '.4' : String(darkness * .62));
      root.current.style.setProperty('--logo-opacity', still ? '.12' : String(.23 - darkness * .13));
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const layoutObserver = new ResizeObserver(schedule);
    sections.forEach(section => layoutObserver.observe(section));
    update();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    media.addEventListener('change', schedule);
    return () => {
      layoutObserver.disconnect();
      ticketObserver?.disconnect();
      page.classList.remove('ticket-panel-visible');
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      media.removeEventListener('change', schedule);
    };
  }, []);
  return <div ref={root} className="continuous-background" aria-hidden="true">
    <div className="continuous-color" />
    <MagicAtmosphere />
    <div className="continuous-veil" />
    <div className="continuous-logo-reveal"><img className="continuous-logo" src="brand/symbol.png" alt="" /></div>
  </div>;
}
