import { ArrowIcon } from './ArrowIcon';
import React, { useEffect, useRef } from 'react';

export function HeroVideo({ onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    const opener = document.activeElement;
    const overflow = document.body.style.overflow;
    const close = () => onClose();
    node.addEventListener('close', close);
    document.body.style.overflow = 'hidden';
    node.showModal();
    return () => {
      node.removeEventListener('close', close);
      node.close();
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);
  return <dialog className="hero-video-dialog" ref={dialog} aria-label="Pajusk Magiško Miško magiją" onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
    <div className="hero-video-bar"><span className="eyebrow">Magiškas Miškas / 01:06</span><button autoFocus onClick={() => dialog.current.close()} aria-label="Uždaryti video">×</button></div>
    <iframe src="https://www.youtube-nocookie.com/embed/iCz-22jfzgg?autoplay=1&rel=0&playsinline=1" title="Magiškas Miškas – pajusk magiją" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
    <div className="hero-video-footer"><span>Gamtai miegant – bunda magija.</span><a href="https://www.youtube.com/watch?v=iCz-22jfzgg" target="_blank" rel="noopener noreferrer">Žiūrėti YouTube <ArrowIcon direction="out" /></a></div>
  </dialog>;
}
