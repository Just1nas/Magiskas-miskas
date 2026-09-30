import React, { useEffect, useRef, useState } from 'react';
import { content } from './content';
import './magic.css';

// Fixed positions keep hydration/layout stable; decoration never intercepts input.
const lights = [
  [68,24,8,-2,3], [85,56,10,-6,2], [53,73,9,-3,3],
  [93,18,11,-7,2], [34,84,9,-1,2], [76,86,8,-4,3],
];
export function MagicAtmosphere() {
  const root=useRef(null);
  const [active,setActive]=useState(false);
  useEffect(()=>{
    const host=root.current.parentElement;
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible=false;
    const update=()=>{
      const enabled=visible&&!document.hidden&&!media.matches&&content.appearance.motion;
      setActive(enabled);host.classList.toggle('magic-active',enabled);
    };
    const observer=window.IntersectionObserver?new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();},{threshold:0}):null;
    if(observer)observer.observe(host);else {visible=true;update();}
    media.addEventListener('change',update);document.addEventListener('visibilitychange',update);
    return ()=>{observer?.disconnect();media.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);host.classList.remove('magic-active');};
  },[]);
  return <div ref={root} className={`magic-atmosphere${active?' is-awake':''}`} aria-hidden="true">
    <div className="magic-halo magic-halo-blue"/><div className="magic-halo magic-halo-warm"/>
    {content.appearance.motion&&lights.map(([x,y,duration,delay,size],i)=><i key={i} className="magic-light" style={{left:`${x}%`,top:`${y}%`,'--drift-time':`${duration}s`,'--drift-delay':`${delay}s`,width:size,height:size}}/>)}
  </div>;
}
