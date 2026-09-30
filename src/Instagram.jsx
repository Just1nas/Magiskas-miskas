import React, { useEffect, useState } from 'react';
import { content as c } from './content';
import { safeHttps, normalizePosts } from './integrations';
import { Gallery } from './Gallery';
import { PostLightbox } from './PostLightbox';

function PostImage({ src }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} /> : <span className="post-image-fallback">Žiūrėti Instagram ↗</span>;
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
        const response = await fetch(endpoint, { signal: controller.signal, credentials: 'omit', cache: 'no-cache' });
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
    <div className="section-heading"><span className="eyebrow">Akimirkos / Instagram</span><h2>Magija, kuria<br />norisi dalintis.</h2>{profile && <a className="text-link" href={profile} target="_blank" rel="noopener noreferrer">@magiskas.miskas ↗</a>}</div>
    {posts.length > 0 ? <Gallery label="Magiško Miško Instagram įrašai" paused={selected !== null}>{posts.map((post, index) => <button className="instagram-post" key={post.id} aria-haspopup="dialog" onClick={() => setSelected(index)} aria-label={`Peržiūrėti Instagram įrašą: ${post.caption}`}>
      <div className="post-image"><PostImage src={post.image} /><span className="post-kind">{post.media_type === 'VIDEO' ? 'Reel' : 'Peržiūrėti'} <span aria-hidden="true">↗</span></span></div>
    </button>)}</Gallery> : <div className="instagram-empty" role="status"><p>{state === 'loading' ? 'Ieškome naujausių akimirkų…' : 'Akimirkos laukia mūsų Instagram.'}</p>{profile && <a className="text-link" href={profile} target="_blank" rel="noopener noreferrer">Atidaryti paskyrą ↗</a>}</div>}
    {selected !== null && posts[selected] && <PostLightbox posts={posts} index={selected} onChange={setSelected} onClose={() => setSelected(null)} />}
  </section>;
}
