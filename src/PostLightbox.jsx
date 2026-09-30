import { ui, locale } from './locale';
import { asset } from './locale';
import React, { useEffect, useRef } from 'react';
import { SocialLink } from './SocialLink';

export function PostLightbox({ posts, index, onChange, onClose }) {
  const dialog = useRef(null);
  const post = posts[index];
  useEffect(() => {
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    const opener = document.activeElement;
    const closed = () => onClose();
    element.addEventListener('close', closed);
    document.body.style.overflow = 'hidden';
    element.showModal();
    return () => {
      element.removeEventListener('close', closed);
      element.close();
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);
  return <dialog ref={dialog} className="post-lightbox" aria-label={ui('Instagram įrašo peržiūra','Instagram post preview')} onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }} onKeyDown={event => {
    if (posts.length < 2 || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); onChange((index + (event.key === 'ArrowRight' ? 1 : -1) + posts.length) % posts.length);
  }}>
    <div className="lightbox-content">
      <button className="lightbox-close" onClick={() => dialog.current.close()} aria-label={ui('Uždaryti peržiūrą','Close preview')} autoFocus>×</button>
      <img src={asset(post.image)} alt={post.caption} />
      <div className="lightbox-copy"><span className="eyebrow">@magiskas.miskas</span><p>{post.caption}</p><SocialLink network="instagram" href={post.permalink} label={post.media_type === 'VIDEO' ? ui('Žiūrėti Reel Instagram','Watch Reel on Instagram') : ui('Atidaryti įrašą Instagram','Open post on Instagram')} />
        {posts.length > 1 && <div className="lightbox-navigation"><button aria-label={ui('Ankstesnė nuotrauka','Previous photo')} onClick={() => onChange((index - 1 + posts.length) % posts.length)}>←</button><button aria-label={ui('Kita nuotrauka','Next photo')} onClick={() => onChange((index + 1) % posts.length)}>→</button></div>}
      </div>
    </div>
  </dialog>;
}
