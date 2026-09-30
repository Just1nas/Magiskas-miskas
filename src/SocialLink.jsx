import React from 'react';
import { safeHttps } from './integrations';

const networks = {
  instagram: { name: 'Instagram', host: 'instagram.com' },
  facebook: { name: 'Facebook', host: 'facebook.com' },
  tiktok: { name: 'TikTok', host: 'tiktok.com' },
};

export function SocialIcon({ network }) {
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false">
    {network === 'instagram' && <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.5" cy="6.5" r="1.2" /></>}
    {network === 'facebook' && <path d="M14 22v-9h3l.5-3.5H14V7.3c0-1 .3-1.8 1.8-1.8h1.9V2.4A24 24 0 0 0 15 2c-2.7 0-4.5 1.7-4.5 4.8v2.7H7.4V13h3.1v9Z" />}
    {network === 'tiktok' && <path d="M16.6 2c.3 2.6 1.7 4.1 4.4 4.3v3.5a9.1 9.1 0 0 1-4.5-1.4v7.1a6.3 6.3 0 1 1-5.4-6.2v3.6a2.8 2.8 0 1 0 1.9 2.6V2Z" />}
  </svg>;
}

export function SocialLink({ network, href, label, className = '' }) {
  const info = networks[network];
  const url = info && safeHttps(href, [info.host]);
  if (!url) return null;
  const name = label || `Magiškas Miškas – ${info.name}`;
  return <a className={`social-link ${className}`} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name} (naujame skirtuke)`} title={name}><SocialIcon network={network} /></a>;
}
