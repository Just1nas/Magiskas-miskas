import { content } from './content.js';
export const fields = {
  tagline: 'Pagrindinis šūkis', description: 'Trumpas aprašymas', city: 'Miestas', date: 'Data',
  pause: 'Didžioji frazė', story: 'Miško istorija', venue: 'Renginio vieta', address: 'Adresas',
  duration: 'Trukmė', hours: 'Darbo laikas',
};
export function editableDefaults() {
  return structuredClone(Object.fromEntries([...Object.keys(fields), 'journey', 'faq', 'practical', 'transport', 'final'].map(key => [key, content[key]])));
}
// Accept only text fields: editor content cannot replace integration URLs, IDs or settings.
export function validateEdits(input) {
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Netinkamas turinio formatas.');
  const result = {};
  const text = value => {
    if (typeof value !== 'string' || value.length > 10000) throw new Error('Tekstas netinkamas arba per ilgas.');
    return value;
  };
  for (const [key, value] of Object.entries(input)) {
    if (Object.hasOwn(fields, key)) result[key] = text(value);
    else if (key === 'final') result.final = { first: text(value?.first), second: text(value?.second) };
    else if (key === 'journey') {
      if (!Array.isArray(value) || value.length !== content.journey.length) throw new Error('Turi likti penkios miško erdvės.');
      result.journey = value.map((zone, i) => ({ id: content.journey[i].id, ...Object.fromEntries(['title','cue','text','detail'].map(k => [k, text(zone?.[k])])) }));
    } else if (['faq','practical','transport'].includes(key)) {
      if (!Array.isArray(value) || !value.length || value.length > 50) throw new Error('Netinkamas įrašų skaičius.');
      if (key !== 'faq' && value.length !== content[key].length) throw new Error('Pasikeitė skilties struktūra.');
      result[key] = value.map((row, i) => {
        if (!Array.isArray(row) || row.length < 2) throw new Error('Trūksta pavadinimo arba teksto.');
        const pair = [text(row[0]), text(row[1])];
        if (key === 'transport' && content.transport[i][2]) pair.push(content.transport[i][2]);
        return pair;
      });
    } else throw new Error('Šis laukas neredaguojamas.');
  }
  return result;
}
