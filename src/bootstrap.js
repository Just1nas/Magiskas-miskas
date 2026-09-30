import { locale, localize } from './locale.js';
import './styles.css';
import { content } from './content.js';
import { validateEdits } from './editable-content.js';
import { cmsUrl, cmsKey, cmsConfigured } from './cms-config.js';
if (cmsConfigured) {
  try {
    const response = await fetch(`${cmsUrl}/rest/v1/site_content?slug=eq.main&select=content`, {
      headers: { apikey: cmsKey }, signal: AbortSignal.timeout(5000), cache: 'no-store',
    });
    if (!response.ok) throw new Error('Content unavailable');
    const rows = await response.json();
    if (rows[0]) Object.assign(content, validateEdits(rows[0].content));
  } catch { /* Keep the complete bundled site available if the CMS cannot be reached. */ }
}
Object.assign(content, localize(content, locale));
document.documentElement.lang = locale;
if (!content.appearance.motion) {
  const style = document.createElement('style');
  style.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}';
  document.head.appendChild(style);
}
document.title = content.name;
document.querySelector('meta[name=description]')?.setAttribute('content',content.description);
document.querySelector('meta[property="og:description"]')?.setAttribute('content',content.description);
document.querySelector('meta[property="og:title"]')?.setAttribute('content',`${content.name} · ${content.tagline}`);
await import('./main.jsx');
