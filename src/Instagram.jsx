import React, { useEffect, useState } from 'react';
import { content as c } from './content';
import { safeHttps, normalizePosts, instagramEmbed } from './integrations';
import { Gallery } from './Gallery';

function ProfileEmbed({ profile }) {
  const source = new URL('embed/', profile.endsWith('/') ? profile : profile + '/').href;
  return <div className="profile-embed"><iframe className="profile-frame" title="Magiško Miško Instagram paskyros galerija" src={source} referrerPolicy="strict-origin-when-cross-origin" /><a className="text-link" href={profile} target="_blank" rel="noopener noreferrer">Visa galerija Instagram ↗</a></div>;
}

function PostImage({ src }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} /> : <span className="post-image-fallback">Žiūrėti Instagram ↗</span>;
}

export function Instagram() {
  const [posts, setPosts] = useState([]);
  const [state, setState] = useState('idle');
  const profile = safeHttps(c.instagram.profileUrl, ['instagram.com']);
  const featured = [...new Set(c.instagram.featured || [])].filter(instagramEmbed).slice(0, 5);
  useEffect(() => {
    const endpoint = c.instagram.endpoint;
    if (!endpoint || !(endpoint.startsWith('/') && !endpoint.startsWith('//') || safeHttps(endpoint))) return;
    let stopped = false, timer, controller;
    async function refresh() {
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      setState('loading');
      try {
        const response = await fetch(endpoint, { signal: controller.signal, credentials: 'omit' });
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
    {posts.length > 0 ? <Gallery label="Naujausi Instagram įrašai">{posts.map(post => <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="instagram-post" key={post.id}>
      <div className="post-image"><PostImage src={post.image} /><span className="post-open" aria-hidden="true">↗</span></div>
      <p>{post.caption}</p><span className="post-bottom"><time dateTime={post.timestamp}>{new Date(post.timestamp).toLocaleDateString('lt-LT')}</time><span>Instagram ↗</span></span>
    </a>)}</Gallery> : profile && c.instagram.mode === 'profile' ? <div className="instagram-live"><div className="instagram-invitation"><span className="eyebrow">Tiesiai iš mūsų paskyros</span><p>Maža akimirka.<br />Didelis laukimas.</p><span>Šviesos, atradimai ir istorijos iš mūsų miško. Susitikime ir Instagram.</span></div><ProfileEmbed profile={profile} /></div> : featured.length > 0 ? <div className={`instagram-embeds ${featured.length === 1 ? 'single-post' : ''}`}>
      {featured.length === 1 && <div className="instagram-invitation"><span className="eyebrow">Pirmieji žvilgsniai į mišką</span><p>Maža akimirka.<br />Didelis laukimas.</p><span>Šviesos, atradimai ir istorijos iš mūsų miško. Susitikime ir Instagram.</span></div>}
      <Gallery label="Magiško Miško Instagram galerija">{featured.map((url, i) => <div className="instagram-embed" key={url}><iframe title={`Magiško Miško Instagram įrašas ${i + 1}`} src={instagramEmbed(url)} loading="lazy" allow="encrypted-media; fullscreen" referrerPolicy="strict-origin-when-cross-origin" /><a className="text-link" href={url} target="_blank" rel="noopener noreferrer">Atidaryti įrašą Instagram ↗</a></div>)}</Gallery>
    </div> : <div className="instagram-empty" role="status"><p>{state === 'loading' ? 'Ieškome naujausių akimirkų…' : 'Akimirkos laukia mūsų Instagram.'}</p>{profile && <a className="text-link" href={profile} target="_blank" rel="noopener noreferrer">Atidaryti paskyrą ↗</a>}</div>}
  </section>;
}
