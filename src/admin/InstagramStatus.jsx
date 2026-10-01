import React, { useEffect, useState } from 'react';
import { cmsUrl, cmsKey } from '../cms-config.js';
import { readInstagramCache, isInstagramFresh } from '../instagram-feed.js';
export function InstagramStatus() {
  const [result,setResult]=useState(null),[error,setError]=useState(false);
  useEffect(()=>{
    let stopped=false,timer,controller;
    async function check(){
      controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
      try {const data=await readInstagramCache(cmsUrl,cmsKey,controller.signal);if(!stopped){setResult(data);setError(false)}}
      catch {if(!stopped)setError(true)}
      finally {clearTimeout(timeout);if(!stopped)timer=setTimeout(check,60000)}
    }
    check();return()=>{stopped=true;clearTimeout(timer);controller?.abort()};
  },[]);
  return <div className="notice" role="status"><strong>Instagram atnaujinimas</strong><p>{result?`Paskutinis sėkmingas tikrinimas: ${new Date(result.checkedAt).toLocaleString('lt-LT')} · Įrašų: ${result.feed.posts.length}`:'Tikrinama…'}</p><p>{error?'Nepavyko patikrinti ryšio.':result&&!isInstagramFresh(result.checkedAt)?'Atnaujinimas vėluoja. Reikia patikrinti Supabase funkcijos žurnalą.':'Serveris tikrina kas 5 min. Atidaryta svetainė naujus duomenis pasiima kas minutę.'}</p></div>;
}
