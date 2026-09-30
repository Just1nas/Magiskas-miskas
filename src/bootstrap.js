import './styles.css';
import { content } from './content.js';
import { validateEdits } from './editable-content.js';
import { cmsUrl, cmsKey, cmsConfigured } from './cms-config.js';
if (cmsConfigured) {
  try {
    const response = await fetch(`${cmsUrl}/rest/v1/site_content?slug=eq.main&select=content`, {
      headers: { apikey: cmsKey }, signal: AbortSignal.timeout(2500), cache: 'no-store',
    });
    if (!response.ok) throw new Error('Content unavailable');
    const rows = await response.json();
    if (rows[0]) Object.assign(content, validateEdits(rows[0].content));
  } catch { /* Keep the complete bundled site available if the CMS cannot be reached. */ }
}
await import('./main.jsx');
