import { ArrowIcon } from './ArrowIcon';
import { ui, locale } from './locale';
import React, { useEffect, useRef } from 'react';
import { content } from './content';
import './monogramIntro.css';

export function MonogramIntro({ onDone, finished }) {
  const root = useRef(null);
  useEffect(() => {
    if (finished) return;
    const el = root.current, page = el.parentElement;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let cancelled = false, timer;
    const animations = [];
    const targets = [...page.querySelectorAll('.header,main,footer,.mobile-ticket')];
    const oldOverflow = document.body.style.overflow;
    const oldRestoration = history.scrollRestoration;
    const reloaded = performance.getEntriesByType('navigation')[0]?.type === 'reload';
    const finish = () => {
      if (cancelled) return;
      cancelled = true; clearTimeout(timer);
      const returnFocus = el.contains(document.activeElement);
      targets.forEach(node => { node.inert = false; });
      document.body.style.overflow = oldOverflow;
      history.scrollRestoration = oldRestoration;
      if (returnFocus) page.querySelector('.header .brand')?.focus({ preventScroll: true });
      onDone();
    };
    el.addEventListener('intro-skip', finish);
    const key = event => { if (event.key === 'Escape') finish(); };
    addEventListener('keydown', key); addEventListener('resize', finish); media.addEventListener('change', finish);
    const cleanup = () => {
      cancelled = true; clearTimeout(timer); animations.forEach(a => a.cancel());
      el.querySelector('.intro-trails')?.replaceChildren();
      targets.forEach(node => { node.inert = false; }); document.body.style.overflow = oldOverflow; history.scrollRestoration = oldRestoration;
      el.removeEventListener('intro-skip', finish); removeEventListener('keydown', key);
      removeEventListener('resize', finish); media.removeEventListener('change', finish);
    };
    if (media.matches || !content.appearance.motion || (location.hash && !reloaded)) { finish(); return cleanup; }
    history.scrollRestoration = 'manual';
    window.scrollTo({top:0,behavior:'instant'});
    targets.forEach(node => { node.inert = true; }); document.body.style.overflow = 'hidden';
    const animate = (node, frames, options) => {
      const a = node.animate(frames, { fill:'both', easing:'cubic-bezier(.45,0,.35,1)', ...options, duration:options.duration * 6 / 9, delay:(options.delay || 0) * 6 / 9 });
      animations.push(a); return a;
    };
    const fade = (node, from, to, delay, duration) => animate(node, [{opacity:from},{opacity:to}], {delay,duration,easing:'ease-in-out'});
    async function start() {
      await Promise.race([
        Promise.all([document.fonts.ready, ...[...el.querySelectorAll('img')].map(img=>img.decode().catch(()=>{}))]),
        new Promise(resolve => { timer = setTimeout(resolve, 1000); }),
      ]);
      if (cancelled) return;
      clearTimeout(timer);
      const bgNode = page.querySelector('.continuous-logo');
      const bg = bgNode.getBoundingClientRect();
      const symbol = el.querySelector('.intro-symbol'), from = symbol.getBoundingClientRect();
      // Match the actual painted bounds of the existing square PNG, not its CSS box.
      // Original alpha bounds: (624,274)-(2370,2600) in a 2953px square.
      const size = Math.min(bg.width,bg.height);
      const ink = {x:bg.x+(bg.width-size)/2+size*624/2953,y:bg.y+(bg.height-size)/2+size*274/2953,width:size*1746/2953,height:size*2326/2953};
      const center = r => ({x:r.x+r.width/2,y:r.y+r.height/2});
      const src = center(from), dst = center(ink);
      const raster = el.querySelector('.intro-raster-symbol');
      Object.assign(raster.style,{left:`${bg.x}px`,top:`${bg.y}px`,width:`${bg.width}px`,height:`${bg.height}px`,transformOrigin:`${dst.x-bg.x}px ${dst.y-bg.y}px`});
      const scale = from.height / ink.height;
      animate(raster,[{transform:`translate(${src.x-dst.x}px,${src.y-dst.y}px) scale(${scale})`},{transform:'translate(0,0) scale(1)'}],{delay:1200,duration:5300});
      // One identical image throughout the flight avoids double edges from
      // blending the vector monogram with the differently textured background.
      animate(raster,[{opacity:1,offset:0},{opacity:1,offset:1200/9000},{opacity:.23,offset:6500/9000},{opacity:.23,offset:1}],{duration:9000,easing:'ease-in-out'});
      // This same image remains as the permanent background after the intro.

      const words = [...page.querySelectorAll('.hero h1 > span')];
      ['.intro-left','.intro-right'].forEach((selector,index) => {
        const original = el.querySelector(selector), initial = original.getBoundingClientRect();
        const letters = [...words[index].querySelectorAll('.intro-letter')];
        const first = letters[0], dest = first.getBoundingClientRect();
        const style = getComputedStyle(first);
        // Keep the supplied vector M throughout its flight: no early swap to a
        // different font box. Only blend with the real title at the landing point.
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const metrics = context.measureText(first.textContent.toLocaleUpperCase('lt'));
        const baseline = document.createElement('i');
        baseline.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline;padding:0;margin:0';
        first.appendChild(baseline);
        const baselineY = baseline.getBoundingClientRect().top;
        baseline.remove();
        const inkTarget = {
          x:dest.x - metrics.actualBoundingBoxLeft,
          y:baselineY - metrics.actualBoundingBoxAscent,
          width:metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
          height:metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
        };
        // The supplied M SVG has a small transparent margin around its artwork.
        const inkStart = {x:initial.x+initial.width*5/180,y:initial.y+initial.height*6/290,width:initial.width*167/180,height:initial.height*278/290};
        const origin = center(inkStart), end = center(inkTarget);
        original.style.transformOrigin = `${origin.x-initial.x}px ${origin.y-initial.y}px`;
        // Both letters depart with the symbol; the second lands later to keep the words sequential.
        const startAt = 1200, duration = index ? 3320 : 2900;
        animate(original,[{transform:'translate(0,0) scale(1)'},{transform:`translate(${end.x-origin.x}px,${end.y-origin.y}px) scale(${inkTarget.width/inkStart.width},${inkTarget.height/inkStart.height})`}],{delay:startAt,duration});
        // A few delayed points follow the same route and dissolve before landing.
        for (let j=0;j<3;j++) {
          const spark=document.createElement('i');
          spark.className='intro-trail-light';
          el.querySelector('.intro-trails').appendChild(spark);
          animate(spark,[{transform:`translate(${origin.x}px,${origin.y}px)`,opacity:0},{opacity:.35,offset:.25},{opacity:.18,offset:.65},{transform:`translate(${end.x}px,${end.y}px)`,opacity:0}],{delay:startAt+j*120,duration});
        }
        const landed = startAt + duration;
        fade(original,1,0,landed-250,650);
        fade(first,0,1,landed-250,650);
        // Overlapping soft reveals feel like a continuous breath, not typing.
        letters.slice(1).forEach((letter,i) => {
          const lift = i % 2 ? '.025em' : '.04em';
          animate(letter,[
            {opacity:0,filter:'blur(3px)',transform:`translateY(${lift}) scale(.985)`},
            {opacity:.7,filter:'blur(.8px)',transform:'translateY(.008em) scale(.997)',offset:.55},
            {opacity:1,filter:'blur(0px)',transform:'translateY(0) scale(1)'},
          ],{delay:landed-100+i*115,duration:1450+(i%3)*75,easing:'cubic-bezier(.22,.55,.3,1)'});
        });
      });
      fade(el.querySelector('.intro-curtain'),1,0,1700,3900);
      fade(page.querySelector('.header'),0,1,6900,1500);
      page.querySelectorAll('.hero-meta,.hero-bottom,.hero-ticket,.hero-title>.eyebrow,.mobile-ticket').forEach(node=>fade(node,0,1,7300,1400));
      timer=setTimeout(finish,6000);
    }
    start().catch(finish);
    return cleanup;
  }, [onDone, finished]);
  return <div ref={root} className={`monogram-intro${finished ? " intro-complete" : ""}`} role="region" aria-label={ui('Magiško Miško atidarymas','Magiškas Miškas introduction')}>
    <div className="intro-curtain" />
    <div className="intro-trails" aria-hidden="true" />
    <div className="intro-lockup" aria-hidden="true">
      <img className="intro-left" src="/brand/intro-m-left.svg" alt="" />
      <img className="intro-symbol" src="/brand/intro-symbol.svg" alt="" />
      <img className="intro-right" src="/brand/intro-m-right.svg" alt="" />
    </div>
    <img className="intro-raster-symbol" src="/brand/symbol.png" alt="" aria-hidden="true" />
    <button className="intro-skip" onClick={()=>root.current.dispatchEvent(new Event('intro-skip'))}>{ui('Praleisti įžangą','Skip introduction')} <ArrowIcon direction="out" /></button>
  </div>;
}
