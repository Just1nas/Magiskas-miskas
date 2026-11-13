import { content as bundled } from '../src/content.js';
import { localize } from '../src/locale.js';
import { validateEdits } from '../src/editable-content.js';
import { safeHttps } from '../src/integrations.js';
import { seasonCopy } from '../src/season-copy.js';

// Date of the last substantive public-copy release, not the build/request date.
export const COPY_UPDATED = '2026-11-13T11:00:00+02:00';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const link = (url,label) => `<a href="${escape(url)}">${escape(label)}</a>`;

export function createPublicContentReader(db, readBackup) {
  let cached = {content: structuredClone(bundled), updatedAt: COPY_UPDATED};
  let expires = 0, pending;
  return async () => {
    if(Date.now() < expires) return cached;
    if(!pending) pending = (async () => {
      try {
        const [[row]] = await db.execute("SELECT content,updated_at FROM mm_content WHERE slug='main'");
        if(row) cached = {content: validateEdits(typeof row.content === 'string' ? JSON.parse(row.content) : row.content), updatedAt: row.updated_at};
      } catch {
        try {const backup=await readBackup();cached={content:validateEdits(backup.content),updatedAt:cached.updatedAt};} catch { /* retain last known good copy */ }
      } finally { expires=Date.now()+15000;pending=null; }
      return cached;
    })();
    // A database outage must never prevent the public website from loading.
    let timer;
    try {return await Promise.race([pending,new Promise(resolve=>{timer=setTimeout(()=>resolve(cached),1000);})]);}
    finally {clearTimeout(timer);}
  };
}

export function initialContent(document, language) {
  const c=localize(document,language), en=language==='en', season=seasonCopy(language);
  const paragraphs=values=>values.filter(Boolean).map(t=>`<p>${escape(t)}</p>`).join('');
  return `<div class="initial-content"><main>
  <section class="section" id="pradzia"><h1>${escape(c.copy.heroFirst)} ${escape(c.copy.heroSecond)}</h1>${paragraphs([season.heading,season.thanks,season.returning])}${link('#atsiliepimai',season.review)}</section>
  <nav aria-label="${en?'Page sections':'Puslapio skiltys'}">${link('#instagram','Instagram')} · ${link('#prisiminimai',season.archive)} · ${link('#atsiliepimai',en?'Reviews':'Atsiliepimai')} · ${link('#kontaktai',en?'Contact':'Kontaktai')}</nav>
  <section class="section" id="instagram"><h2>${escape(c.copy.instagramTitle)}</h2>${link(safeHttps(c.instagram.profileUrl)||'#kontaktai','Instagram')}</section>
  <section class="section" id="prisiminimai"><h2>${escape(season.archive)}</h2><details><summary>${escape(season.archive)}</summary><p>${escape(season.archiveNote)}</p>${c.journey.map(z=>`<article><h3>${escape(z.title)}</h3>${paragraphs([z.text,z.detail])}</article>`).join('')}${link(en?'/en/gidas/':'/gidas/',en?'2026 forest guide':'2026 m. Miško gidas')}</details></section>
  <section class="section" id="atsiliepimai"><h2>${escape(season.review)}</h2><p>${en?'Visitor reviews and the review form are available when JavaScript is enabled.':'Lankytojų atsiliepimai ir jų forma pasiekiami įjungus JavaScript.'}</p></section>
  </main><footer id="kontaktai">${c.contactEmail?link(`mailto:${c.contactEmail}`,c.contactEmail):''} ${link('tel:+37069906696','+370 699 06696')} ${[c.instagram.profileUrl,c.socials.facebook,c.socials.tiktok].filter(value=>safeHttps(value)).map(url=>link(url,new URL(url).hostname)).join(' · ')}</footer></div>`;
}

export function structuredData(document, language, origin) {
  const c=localize(document,language), url=origin+(language==='en'?'/en/':'/');
  return {'@context':'https://schema.org','@graph':[
    {'@type':'Organization','@id':origin+'/#organization',name:document.name,url:origin+'/',logo:origin+'/favicon.png',telephone:'+37069906696',...(document.contactEmail?{email:document.contactEmail}:{}),sameAs:[document.instagram.profileUrl,document.socials.facebook,document.socials.tiktok].filter(value=>safeHttps(value))},
    {'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:document.name,inLanguage:['lt','en'],publisher:{'@id':origin+'/#organization'}},
    {'@type':'WebPage','@id':url+'#webpage',url,name:c.name,description:seasonCopy(language).description,inLanguage:language,isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#organization'}}
  ]};
}

export function renderHomepage(html, snapshot, language, origin) {
  const doc=snapshot.content;
  // The same public snapshot starts React; subsequent admin edits still load normally.
  const data=`<script id="public-content" type="application/json">${json(doc)}</script><script type="application/ld+json">${json(structuredData(doc,language,origin))}</script>`;
  // Preserve the existing blank startup/intro. If JavaScript fails, show the real content.
  const loading='<style>.initial-content{animation:mm-content-ready 0s 8s both}@keyframes mm-content-ready{from{visibility:hidden}to{visibility:visible}}</style><noscript><style>.initial-content{animation:none}</style></noscript>';
  return html.replace('<div id="root"></div>',`<div id="root">${initialContent(doc,language)}</div>`).replace(/<noscript>[\s\S]*?<\/noscript>/,'').replace('</head>',data+loading+'</head>');
}

export function renderSitemap(xml, updatedAt) {
  const dates=[Date.parse(COPY_UPDATED),Date.parse(updatedAt)].filter(Number.isFinite);
  const date=new Date(Math.max(...dates)).toISOString();
  return xml.replace(/\s*<lastmod>[^<]*<\/lastmod>/g,'').replace(/(<loc>[^<]+<\/loc>)/g,`$1\n    <lastmod>${date}</lastmod>`);
}
