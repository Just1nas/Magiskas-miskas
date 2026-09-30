import React, { useEffect, useRef } from 'react';

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
  return <dialog ref={dialog} className="post-lightbox" aria-label="Instagram įrašo peržiūra" onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }} onKeyDown={event => {
    if (posts.length < 2 || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); onChange((index + (event.key === 'ArrowRight' ? 1 : -1) + posts.length) % posts.length);
  }}>
    <div className="lightbox-content">
      <button className="lightbox-close" onClick={() => dialog.current.close()} aria-label="Uždaryti peržiūrą" autoFocus>×</button>
      <img src={post.image} alt={post.caption} />
      <div className="lightbox-copy"><span className="eyebrow">@magiskas.miskas</span><p>{post.caption}</p><a className="text-link" href={post.permalink} target="_blank" rel="noopener noreferrer">{post.media_type === 'VIDEO' ? 'Žiūrėti Reel Instagram' : 'Atidaryti įrašą Instagram'} ↗</a>
        {posts.length > 1 && <div className="lightbox-navigation"><button aria-label="Ankstesnė nuotrauka" onClick={() => onChange((index - 1 + posts.length) % posts.length)}>←</button><button aria-label="Kita nuotrauka" onClick={() => onChange((index + 1) % posts.length)}>→</button></div>}
      </div>
    </div>
  </dialog>;
}
