import { ArrowIcon } from './ArrowIcon';
import { ui } from './locale';
import React, { createContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
export const GalleryContext = createContext({});

export function Gallery({ children, label, paused=false, autoplay=true, intervalMs=6500, caption='Akimirkos iš mūsų miško' }) {
  const items=React.Children.toArray(children), count=items.length;
  const track=useRef(null), settling=useRef(null), current=useRef(0);
  const [active,setActive]=useState(current.current), [playing,setPlaying]=useState(autoplay);
  const [hovered,setHovered]=useState(false), [visible,setVisible]=useState(false), [hidden,setHidden]=useState(document.hidden), [reduced,setReduced]=useState(false);
  const [failed,setFailed]=useState([]), [blocked,setBlocked]=useState(false), [ended,setEnded]=useState(false);
  const multiple=count>1;
  const select=index=>{current.current=index;setActive(index);setBlocked(false);setEnded(false)};
  const jump=index=>{const el=track.current; if(!el?.children[index])return;el.scrollTo({left:el.children[index].offsetLeft,behavior:'instant'});select(index)};
  useLayoutEffect(()=>{
    jump(0);
    const resize=new ResizeObserver(()=>jump(current.current%count));
    resize.observe(track.current);
    return()=>{resize.disconnect();clearTimeout(settling.current)};
  },[count]);
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReduced(media.matches), visibility=()=>setHidden(document.hidden);
    update();media.addEventListener('change',update);document.addEventListener('visibilitychange',visibility);
    const observer=new IntersectionObserver(([e])=>setVisible(e.isIntersecting),{threshold:.25});observer.observe(track.current);
    return()=>{observer.disconnect();media.removeEventListener('change',update);document.removeEventListener('visibilitychange',visibility)};
  },[]);
  const move=step=>{
    const el=track.current,index=(current.current+step+count)%count;
    if(el?.children[index])el.scrollTo({left:el.children[index].offsetLeft,behavior:reduced?'instant':'smooth'});
  };
  const canAdvance=playing&&!hovered&&!paused&&!hidden&&visible&&!reduced&&!blocked;
  const post=items[active%count]?.props.post;
  const video=post?.video&&!failed.includes(post.id);
  useEffect(()=>{
    if(!multiple||!canAdvance||(video&&!ended))return;
    const timer=setTimeout(()=>move(1),ended?300:intervalMs);return()=>clearTimeout(timer);
  },[active,canAdvance,video,count,intervalMs,ended]);
  const onScroll=()=>{
    const el=track.current;
    const positions=[...el.children].map(child=>Math.abs(child.offsetLeft-el.scrollLeft));
    const index=positions.indexOf(Math.min(...positions));
    if(index!==current.current)select(index);
    clearTimeout(settling.current);

  };
  const context={active,visible:visible&&!hidden&&!paused,reduced,count,onEnded:()=>setEnded(true),onVideoError:id=>setFailed(old=>old.includes(id)?old:[...old,id]),onPlaybackBlocked:()=>setBlocked(true),onManualPlay:()=>setBlocked(false)};
  const slides=items;
  return <GalleryContext.Provider value={context}><div className={`gallery gallery-loop ${multiple?'':'is-single'} ${visible?'is-visible':''}`} role="region" aria-label={label} aria-roledescription={ui('karuselė','carousel')} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
    {multiple&&<div className="gallery-controls"><span className="small-note">{caption} <span className="gallery-count">{active%count+1} / {count}</span></span><div>
      <button onClick={()=>{setPlaying(false);move(-1)}} aria-label={ui('Ankstesnis Instagram įrašas','Previous Instagram post')}><ArrowIcon direction="left"/></button>
      {!reduced&&<button className="gallery-play" onClick={()=>setPlaying(!playing)} aria-label={playing?ui('Sustabdyti galeriją','Pause gallery'):ui('Paleisti galeriją','Play gallery')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{playing?<path d="M8 5v14M16 5v14"/>:<path d="m8 5 11 7-11 7Z"/>}</svg></button>}
      <button onClick={()=>{setPlaying(false);move(1)}} aria-label={ui('Kitas Instagram įrašas','Next Instagram post')}><ArrowIcon direction="right"/></button>
    </div></div>}
    <div ref={track} className="gallery-track" tabIndex="0" aria-label={ui('Instagram įrašai','Instagram posts')} onFocusCapture={()=>setPlaying(false)} onPointerDown={()=>setPlaying(false)} onScroll={onScroll} onKeyDown={e=>{if(e.target===e.currentTarget&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setPlaying(false);move(e.key==='ArrowRight'?1:-1)}}}>
      {slides.map((child,index)=>React.cloneElement(child,{key:`${child.key}-${Math.floor(index/count)}`,index,duplicate:false}))}
    </div>
  </div></GalleryContext.Provider>;
}
