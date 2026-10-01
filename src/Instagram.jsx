import { cmsUrl, cmsKey, cmsConfigured } from './cms-config.js';
import { readInstagramCache, isInstagramFresh } from './instagram-feed.js';
import { ArrowIcon } from './ArrowIcon';
import { ui, locale } from './locale';
import { asset } from './locale';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { content as c } from './content';
import { safeHttps, normalizePosts } from './integrations';
import { Gallery, GalleryContext } from './Gallery';
import { PostLightbox } from './PostLightbox';
import { SocialLink, SocialIcon } from './SocialLink';

function PostImage({ src }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} /> : <span className="post-image-fallback"><SocialIcon network="instagram" /></span>;
}

function MediaIcon({kind}) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{kind==='pause'?<path d="M8 5v14M16 5v14"/>:kind==='play'?<path d="m8 5 11 7-11 7Z"/>:<><path d="M11 5 6 9H3v6h3l5 4Z"/>{kind==='muted'?<path d="m16 9 5 6m0-6-5 6"/>:<path d="M16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>}</>}</svg>;
}
function GalleryPost({post,index,onOpen,duplicate=false}) {
  const {active,visible,reduced,onEnded,onVideoError,onPlaybackBlocked,onManualPlay}=useContext(GalleryContext);
  const video=useRef(null);
  const [muted,setMuted]=useState(true),[failed,setFailed]=useState(false),[playing,setPlaying]=useState(false);
  const eligible=active===index&&visible;
  useEffect(()=>{
    const el=video.current;if(!el)return;
    if(eligible&&!reduced)el.play().catch(()=>{setPlaying(false);onPlaybackBlocked()});
    else el.pause();
    return()=>el.pause();
  },[eligible,reduced,failed]);
  const toggle=()=>{const el=video.current;if(!el)return;if(el.paused){onManualPlay();el.play().catch(()=>onPlaybackBlocked())}else{el.pause();onPlaybackBlocked()}};
  const tabIndex=duplicate?-1:0;
  return <article className={`instagram-post ${eligible?'is-active':''}`}>
    <div className="post-image"><PostImage src={asset(post.image)}/>
      {post.video&&!failed&&eligible&&<video ref={video} src={asset(post.video)} poster={asset(post.image)} muted={muted} playsInline preload="metadata" onEnded={onEnded} onError={()=>{setFailed(true);onVideoError(post.id)}} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} aria-label={post.caption||ui('Magiško Miško vaizdo įrašas','Magiškas Miškas video')}/>}
      <button className="post-open" tabIndex={tabIndex} aria-haspopup="dialog" onClick={onOpen} aria-label={`${ui('Peržiūrėti Instagram įrašą','View Instagram post')}${post.caption?': '+post.caption:''}`}><span className="post-expand"><ArrowIcon direction="out"/></span></button>
      {post.video&&!failed&&eligible&&<div className="post-video-controls">
        <button tabIndex={tabIndex} onClick={toggle} aria-label={playing?ui('Sustabdyti vaizdo įrašą','Pause video'):ui('Paleisti vaizdo įrašą','Play video')}><MediaIcon kind={playing?'pause':'play'}/></button>
        <button tabIndex={tabIndex} onClick={()=>setMuted(!muted)} aria-label={muted?ui('Įjungti garsą','Unmute'):ui('Išjungti garsą','Mute')}><MediaIcon kind={muted?'muted':'sound'}/></button>
      </div>}
      {post.video&&!eligible&&<span className="post-reel" aria-hidden="true"><MediaIcon kind="play"/></span>}
    </div>
  </article>;
}

export function Instagram() {
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [state, setState] = useState('idle');
  const profile = safeHttps(c.instagram.profileUrl, ['instagram.com']);
  useEffect(() => {
    const endpoint = c.instagram.endpoint;
    if (!endpoint || !(endpoint === './instagram/feed.json' || endpoint.startsWith('/') && !endpoint.startsWith('//') || safeHttps(endpoint))) return;
    const serverCache = cmsConfigured && ['./instagram/feed.json', '/instagram/feed.json'].includes(endpoint);
    let stopped = false, timer, controller, lastChecked;
    async function refresh() {
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      setState('loading');
      try {
        let payload;
        if (serverCache) {
          const result = await readInstagramCache(cmsUrl, cmsKey, controller.signal);
          lastChecked = result.checkedAt;
          if (!isInstagramFresh(lastChecked)) throw new Error('Feed is stale');
          payload = result.feed;
        } else {
          const response = await fetch(endpoint === './instagram/feed.json' ? '/instagram/feed.json' : endpoint, { signal: controller.signal, credentials: 'omit', cache: 'no-store' });
          if (!response.ok) throw new Error('Feed unavailable');
          payload = await response.json();
        }
        const items = normalizePosts(payload, c.instagram.limit);
        if (!stopped) { setPosts(items); setState('ready'); }
      } catch { if (!stopped) { setState('error'); if (serverCache && !isInstagramFresh(lastChecked)) setPosts([]); } }
      finally { clearTimeout(timeout); if (!stopped) timer = setTimeout(refresh, serverCache ? 60000 : Math.max(60000, c.instagram.refreshMs)); }
    }
    refresh();
    return () => { stopped = true; clearTimeout(timer); controller?.abort(); };
  }, []);
  useEffect(() => setSelected(null), [posts]);
  return <section id="instagram" className="section instagram">
    <div className="section-heading"><span className="eyebrow">{c.copy.instagramLabel}</span><h2 style={{whiteSpace:"pre-line"}}>{c.copy.instagramTitle}</h2>{profile && <SocialLink network="instagram" href={profile} />}</div>
    {posts.length > 0 ? <Gallery autoplay={c.instagram.autoplay} intervalMs={c.instagram.intervalMs} caption={c.copy.galleryLabel} label={ui('Magiško Miško Instagram įrašai','Magiškas Miškas Instagram posts')} paused={selected !== null}>{posts.map((post,index)=><GalleryPost key={post.id} post={post} index={index} onOpen={()=>setSelected(index)}/>) }</Gallery> : <div className="instagram-empty" role="status"><p>{state === 'loading' ? ui('Ieškome naujausių akimirkų…','Loading our latest moments…') : c.copy.instagramEmpty}</p>{profile && <SocialLink network="instagram" href={profile} />}</div>}
    {selected !== null && posts[selected] && <PostLightbox posts={posts} index={selected} onChange={setSelected} onClose={() => setSelected(null)} />}
  </section>;
}
