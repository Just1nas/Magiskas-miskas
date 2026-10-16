import { content } from './content.js';
import { validateEdits, mergeEdits } from './editable-content.js';
import { cmsUrl, cmsKey, cmsConfigured } from './cms-config.js';
const page = document.querySelector('[data-cms-page]')?.dataset.cmsPage;
function apply(documentContent) {
  const values = documentContent[page];
  if (!values) return;
  document.querySelectorAll('[data-cms-text]').forEach(node => {
    const value = values[node.dataset.cmsText];
    if (typeof value === 'string') node.textContent = value;
  });
  for (const attribute of ['href', 'src', 'alt', 'aria-label']) {
    document.querySelectorAll(`[data-cms-${attribute}]`).forEach(node => {
      const value = values[node.getAttribute(`data-cms-${attribute}`)];
      if (typeof value === 'string') node.setAttribute(attribute, value);
    });
  }
  const heading = document.querySelector('h1');
  if (heading && !document.querySelector('title[data-cms-text]')) document.title = `${heading.textContent} · Magiškas Miškas`;
}
apply(content);
const preview = window.parent !== window && new URLSearchParams(location.search).get('adminPreview') === '1';
if (preview) {
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== window.parent || event.data?.type !== 'mm-preview-content') return;
    try { apply(mergeEdits(validateEdits(event.data.content))); } catch { /* Keep last valid draft. */ }
  });
}
if (cmsConfigured) {
  try {
    const response = await fetch(`${cmsUrl}/rest/v1/site_content?slug=eq.main&select=content`, {
      headers: { apikey: cmsKey }, signal: AbortSignal.timeout(5000), cache: 'no-store',
    });
    if (!response.ok) throw new Error('Unavailable');
    const rows = await response.json();
    if (rows[0]) apply(mergeEdits(rows[0].content));
  } catch { /* Original complete HTML remains available. */ }
}
if (preview) window.parent.postMessage({ type: 'mm-preview-ready' }, location.origin);
