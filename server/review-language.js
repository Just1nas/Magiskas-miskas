// Deliberately narrow word families: criticism is welcome; profanity is not.
// Keep boundaries so ordinary words/names containing a short fragment remain valid.
const families = [
 'ble[dt]', 'kurv[a-z]*', 'p[iy]zd[a-z]*', 'byb[a-z]*', 'bib(?:is|ys|io|iu|i)',
 'sud(?:as|a|e|ai|o|u|ui|ais|inas|ina|inai|ini|in[oa]s)', 'sikn[a-z]*',
 '(?:ap|pri|nu|pa)?sik(?:t|ti|au|a|o|it|ite)',
 '(?:na|po)(?:h|ch|x)u[ij][a-z]*', '(?:ch|h|x)u[ij][a-z]*',
 '(?:job|jeb)[a-z]*', 'bl[ey]at[dt]?',
 '(?:mother)?fuck[a-z]*', 'bullshit[a-z]*',
 'shit(?:s|ty|tier|tiest|ting|ted|head|heads|hole|holes)?',
 'bitch(?:es|ing|y)?', 'cunt(?:s)?', 'as(?:hole|holes)', 'dick(?:head|heads)?',
 'бля[дт]ь?', 'бляд[а-я]*', 'сука', 'суки', 'суч[а-я]*',
 '(?:на|по)?ху[йеяию][а-я]*', 'пизд[а-я]*', '(?:за|на|вы|от|по)?[её]б[а-я]*',
];
const forbidden = new RegExp(`^(?:${families.join('|')})$`, 'u');
const substitutions = {'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','@':'a','$':'s'};
function normalize(value) {
 return value.normalize('NFKD').toLowerCase().replace(/[\p{M}\p{Cf}]/gu,'')
  .replace(/[0134578@$]/g,letter=>substitutions[letter]);
}
function matches(word) {
 // Repeated letters are a common evasion; patterns use single-letter runs too.
 return forbidden.test(word) || forbidden.test(word.replace(/(.)\1+/gu,'$1'));
}
export function containsReviewProfanity(value) {
 const normalized=normalize(value);
 const words=normalized.match(/[\p{L}\p{N}]+/gu)||[];
 if(words.some(matches))return true;
 // Join punctuation-masked words (b.l.e.t, f*uck), but never whole sentences.
 const masked=normalized.match(/[\p{L}\p{N}]+(?:[.*_\-/]+[\p{L}\p{N}]+)+/gu)||[];
 if(masked.some(word=>matches(word.replace(/[^\p{L}\p{N}]/gu,''))))return true;
 // Space-separated individual letters, bounded to avoid joining normal prose.
 const spelled=normalized.match(/(?<![\p{L}\p{N}])(?:[\p{L}\p{N}]\s+){2,}[\p{L}\p{N}](?![\p{L}\p{N}])/gu)||[];
 return spelled.some(word=>matches(word.replace(/\s/g,'')));
}
