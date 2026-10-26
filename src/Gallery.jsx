import { ArrowIcon } from './ArrowIcon';
import { ui } from './locale';
import { logicalSlide, nearestSlide, restingSlide } from './gallery-position';
import React, { createContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
export const GalleryContext = createContext({});

export function Gallery({ children, label, paused=false, autoplay=true, intervalMs=6500, caption='Akimirkos iš mūsų miško' }) {
  const items=React.Children.toArray(children), count=items.length;
  const track=useRef(null), settling=useRef(null), current=useRef(0), shifting=useRef(false);
  const [active,setActive]=useState(0), [playing,setPlaying]=useState(autoplay), [loop,setLoop]=useState(false), [moving,setMoving]=useState(false);
  const [hovered,setHovered]=useState(false), [dragging,setDragging]=useState(false), [visible,setVisible]=useState(false), [hidden,setHidden]=useState(document.hidden), [reduced,setReduced]=useState(false);
  const [failed,setFailed]=useState([]), [blocked,setBlocked]=useState(false), [ended,setEnded]=useState(false);
  const multiple=count>1;
  const select=index=>{if(current.current!==index){current.current=index;setActive(index);setBlocked(false);setEnded(false)}};
  const jump=index=>{const el=track.current;if(!el?.children[index])return;el.scrollTo({left:el.children[index].offsetLeft-el.children[0].offsetLeft,behavior:'instant'});select(index)};
  useLayoutEffect(()=>{
    const el=track.current;
    const resize=new ResizeObserver(()=>{
      const columns=Number(getComputedStyle(el).getPropertyValue('--gallery-columns'))||1;
      const next=count>columns;setLoop(next);if(next===loop)jump(restingSlide(current.current,count,loop));
    });
    resize.observe(el);
    return()=>{resize.disconnect();clearTimeout(settling.current)};
  },[count,loop]);
  useLayoutEffect(()=>{clearTimeout(settling.current);shifting.current=false;jump(restingSlide(current.current,count,loop))},[loop,count]);
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReduced(media.matches), visibility=()=>setHidden(document.hidden);
    update();media.addEventListener('change',update);document.addEventListener('visibilitychange',visibility);
    const observer=new IntersectionObserver(([e])=>setVisible(e.isIntersecting),{threshold:.25});observer.observe(track.current);
    return()=>{observer.disconnect();media.removeEventListener('change',update);document.removeEventListener('visibilitychange',visibility)};
  },[]);
  const settle=()=>{
    shifting.current=false;setMoving(false);
    const el=track.current,offset=el.children[0].offsetLeft;
    const index=nearestSlide([...el.children].map(child=>child.offsetLeft-offset),el.scrollLeft);
    if(loop)jump(restingSlide(index,count,true));else select(logicalSlide(current.current,count));
  };
  const move=step=>{
    if(shifting.current)return;
    const el=track.current,index=loop?current.current+step:logicalSlide(current.current+step,count);
    if(!loop){select(index);return;}
    shifting.current=true;setMoving(true);
    el.scrollTo({left:el.children[index].offsetLeft-el.children[0].offsetLeft,behavior:reduced?'instant':'smooth'});
    clearTimeout(settling.current);settling.current=setTimeout(settle,500);
  };
  const canAdvance=playing&&!hovered&&!paused&&!hidden&&visible&&!reduced&&!blocked&&!moving&&!dragging;
  const logical=logicalSlide(active,count),post=items[logical]?.props.post;
  const video=post?.video&&!failed.includes(post.id);
  useEffect(()=>{
    if(!multiple||!canAdvance||shifting.current||(video&&!ended))return;
    const timer=setTimeout(()=>move(1),ended?300:intervalMs);return()=>clearTimeout(timer);
  },[active,canAdvance,video,count,intervalMs,ended,loop]);
  const onScroll=()=>{
    const el=track.current,offset=el.children[0].offsetLeft;
    const index=nearestSlide([...el.children].map(child=>child.offsetLeft-offset),el.scrollLeft);
    if(loop)select(index);
    clearTimeout(settling.current);settling.current=setTimeout(settle,160);
  };
  const context={active:logical,visible:visible&&!hidden&&!paused,playing,reduced,count,onEnded:()=>setEnded(true),onVideoError:id=>setFailed(old=>old.includes(id)?old:[...old,id]),onPlaybackBlocked:()=>setBlocked(true),onManualPlay:()=>{setBlocked(false);setPlaying(true)}};
  const slides=loop?[...items,...items,...items]:items;
  return <GalleryContext.Provider value={context}><div className={`gallery gallery-loop ${multiple?'':'is-single'} ${visible?'is-visible':''}`} role="region" aria-label={label} aria-roledescription={ui('karuselė','carousel')} style={{'--gallery-count':count}} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
    {multiple&&<div className="gallery-controls"><span className="small-note">{caption} <span className="gallery-count">{logical+1} / {count}</span></span><div>
      <button onClick={()=>move(-1)} aria-label={ui('Ankstesnis Instagram įrašas','Previous Instagram post')}><ArrowIcon direction="left"/></button>
      {!reduced&&<button className="gallery-play" onClick={()=>setPlaying(!playing)} aria-label={playing?ui('Sustabdyti galeriją','Pause gallery'):ui('Paleisti galeriją','Play gallery')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{playing?<path d="M8 5v14M16 5v14"/>:<path d="m8 5 11 7-11 7Z"/>}</svg></button>}
      <button onClick={()=>move(1)} aria-label={ui('Kitas Instagram įrašas','Next Instagram post')}><ArrowIcon direction="right"/></button>
    </div></div>}
    <div ref={track} className="gallery-track" tabIndex="0" aria-label={ui('Instagram įrašai','Instagram posts')} onFocusCapture={e=>{if(e.target.matches(':focus-visible'))setPlaying(false)}} onPointerDown={()=>setDragging(true)} onPointerUp={()=>setDragging(false)} onPointerCancel={()=>setDragging(false)} onPointerLeave={()=>setDragging(false)} onLostPointerCapture={()=>setDragging(false)} onScroll={onScroll} onKeyDown={e=>{if(e.target===e.currentTarget&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setPlaying(false);move(e.key==='ArrowRight'?1:-1)}}}>
      {slides.map((child,index)=>{const duplicate=loop&&(index<count||index>=count*2);return React.cloneElement(child,{key:`${child.key}-${Math.floor(index/count)}`,index:index%count,duplicate})})}
    </div>
  </div></GalleryContext.Provider>;
}
