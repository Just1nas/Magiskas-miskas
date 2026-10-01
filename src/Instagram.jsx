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

function GalleryPost({post,index,onOpen}) {
  const {active,visible,reduced,count,onEnded,onVideoError}=useContext(GalleryContext);
  const video=useRef(null);
  const [paused,setPaused]=useState(false), [muted,setMuted]=useState(true), [failed,setFailed]=useState(false), [playing,setPlaying]=useState(false);
  const [requested,setRequested]=useState(false);
  const eligible=active===index&&visible;
  useEffect(()=>{
    const el=video.current;if(!el)return;
    if(eligible&&!paused&&(!reduced||requested)) el.play().catch(()=>setPlaying(false));
    else el.pause();
  },[eligible,paused,reduced,requested,failed]);
  return <article className="instagram-post">
    <div className="post-image"><PostImage src={asset(post.image)}/>
      {post.video&&!failed ? <>
        <video ref={video} src={eligible?asset(post.video):undefined} poster={asset(post.image)} muted={muted} playsInline preload="none" loop={count===1} onEnded={onEnded} onError={()=>{setFailed(true);onVideoError(post.id)}} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} aria-label={post.caption}/>
        <div className="post-video-controls">
          <button onClick={()=>{setPaused(playing);setRequested(true)}} aria-label={playing?ui('Sustabdyti vaizdo įrašą','Pause video'):ui('Paleisti vaizdo įrašą','Play video')}>{playing?ui('Pauzė','Pause'):ui('Paleisti','Play')}</button>
          <button onClick={()=>setMuted(!muted)} aria-label={muted?ui('Įjungti garsą','Unmute'):ui('Išjungti garsą','Mute')}>{muted?ui('Įjungti garsą','Unmute'):ui('Išjungti garsą','Mute')}</button>
          <button onClick={onOpen} aria-label={ui('Atidaryti Instagram įrašo informaciją','Open Instagram post details')}><ArrowIcon direction="out" /></button>
        </div>
      </> : <button className="post-open" aria-haspopup="dialog" onClick={onOpen} aria-label={`${ui('Peržiūrėti Instagram įrašą','View Instagram post')}: ${post.caption}`}><span className="post-kind">{post.media_type==='VIDEO'?'Reel':ui('Peržiūrėti','View')} <ArrowIcon direction="out" /></span></button>}
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
    let stopped = false, timer, controller;
    async function refresh() {
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      setState('loading');
      try {
        const response = await fetch(endpoint === './instagram/feed.json' ? '/instagram/feed.json' : endpoint, { signal: controller.signal, credentials: 'omit', cache: 'no-cache' });
        if (!response.ok) throw new Error('Feed unavailable');
        const items = normalizePosts(await response.json(), c.instagram.limit);
        if (!stopped) { setPosts(items); setState('ready'); }
      } catch { if (!stopped) setState('error'); }
      finally { clearTimeout(timeout); if (!stopped) timer = setTimeout(refresh, Math.max(60000, c.instagram.refreshMs)); }
    }
    refresh();
    return () => { stopped = true; clearTimeout(timer); controller?.abort(); };
  }, []);
  return <section id="instagram" className="section instagram">
    <div className="section-heading"><span className="eyebrow">{c.copy.instagramLabel}</span><h2 style={{whiteSpace:"pre-line"}}>{c.copy.instagramTitle}</h2>{profile && <SocialLink network="instagram" href={profile} />}</div>
    {posts.length > 0 ? <Gallery autoplay={c.instagram.autoplay} intervalMs={c.instagram.intervalMs} caption={c.copy.galleryLabel} label={ui('Magiško Miško Instagram įrašai','Magiškas Miškas Instagram posts')} paused={selected !== null}>{posts.map((post,index)=><GalleryPost key={post.id} post={post} index={index} onOpen={()=>setSelected(index)}/>) }</Gallery> : <div className="instagram-empty" role="status"><p>{state === 'loading' ? ui('Ieškome naujausių akimirkų…','Loading our latest moments…') : c.copy.instagramEmpty}</p>{profile && <SocialLink network="instagram" href={profile} />}</div>}
    {selected !== null && posts[selected] && <PostLightbox posts={posts} index={selected} onChange={setSelected} onClose={() => setSelected(null)} />}
  </section>;
}
