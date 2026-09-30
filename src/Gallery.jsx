import React, { useEffect, useRef, useState } from 'react';

export function Gallery({ children, label, paused = false, autoplay = true, intervalMs = 6500, caption = "Akimirkos iš mūsų miško" }) {
  const viewport = useRef(null);
  const count = React.Children.count(children);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update(); media.addEventListener('change', update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(viewport.current);
    return () => { media.removeEventListener('change', update); observer.disconnect(); };
  }, []);
  const move = index => {
    const element = viewport.current;
    const target = element?.children[(index + count) % count];
    if (target) element.scrollTo({ left: target.offsetLeft, behavior: reduced ? 'instant' : 'smooth' });
  };
  useEffect(() => {
    if (paused || !playing || hovered || !visible || reduced || count < 2) return;
    const timer = setInterval(() => { if (!document.hidden) move(active + 1); }, intervalMs);
    return () => clearInterval(timer);
  }, [active, count, playing, hovered, visible, reduced, paused, intervalMs]);
  return <div className={`gallery ${count === 1 ? 'is-single' : ''} ${visible ? 'is-visible' : ''}`} role="region" aria-label={label} aria-roledescription="karuselė" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    {count > 1 && <div className="gallery-controls"><span className="small-note">{caption}</span><div>
      <button onClick={() => { setPlaying(false); move(active - 1); }} aria-label="Ankstesnis Instagram įrašas">←</button>
      {!reduced && <button className="gallery-play" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Sustabdyti galeriją' : 'Paleisti galeriją'}>{playing ? 'Pauzė' : 'Paleisti'}</button>}
      <button onClick={() => { setPlaying(false); move(active + 1); }} aria-label="Kitas Instagram įrašas">→</button>
    </div></div>}
    <div ref={viewport} className="gallery-track" tabIndex="0" aria-label="Instagram įrašai" onFocusCapture={() => setPlaying(false)} onPointerDown={() => setPlaying(false)} onScroll={() => {
      const element = viewport.current;
      const positions = [...element.children].map(child => Math.abs(child.offsetLeft - element.scrollLeft));
      setActive(positions.indexOf(Math.min(...positions)));
    }}>{children}</div>
  </div>;
}
