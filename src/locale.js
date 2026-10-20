export const locale = typeof location !== 'undefined' && /^\/en(?:\/|$)/.test(location.pathname) ? 'en' : 'lt';
export function localize(document, language) {
  const result = structuredClone(document);
  if (language !== 'en') return result;
  const en = result.translations.en;
  for (const [key,value] of Object.entries(en)) {
    if (key === 'tickets' || key === 'season' || key === 'guide') result[key] = {...result[key],...value};
    else if (key === 'transport') result[key] = value.map((row,i)=>[...row.slice(0,2), document.transport[i]?.[2] || '']);
    else result[key] = value;
  }
  // Legacy EN documents still have the initial placeholder; use the confirmed shared time.
  if (en.hours === 'Opening hours will be announced soon') result.hours = document.hours;
  return result;
}
export function languageUrl(language, search = '', hash = '') {
  return `${language === 'en' ? '/en/' : '/'}${search}${hash}`;
}
export function guideUrl(language,search='',hash=''){return `${language==='en'?'/en/gidas/':'/gidas/'}${search}${hash}`;}
export const asset = value => typeof value === 'string' && /^(brand|images|partners|instagram)\//.test(value) ? '/' + value : value;
export const ui = (lt,en) => locale === 'en' ? en : lt;
