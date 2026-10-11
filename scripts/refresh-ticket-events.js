import { writeFile } from 'node:fs/promises';
import { TICKET_SERIES_URL } from '../src/ticketSelection.js';
try {
  const response = await fetch(TICKET_SERIES_URL, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  const match = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error('Schedule data missing');
  const data = JSON.parse(match[1]);
  const series = data.find(value => value && !Array.isArray(value) && data[value.id] === 'FOPZN745ZJ' && 'events' in value);
  if (!series) throw new Error('Series missing');
  const events = data[series.events].map(index => data[index]).map(event => ({
    id: data[event.id], eventStartAt: data[event.eventStartAt],
    eventEndAt: data[event.eventEndAt], status: data[event.status],
  }));
  if (!events.every(event => typeof event.id === 'string' && Number.isFinite(Date.parse(event.eventEndAt)))) throw new Error('Invalid schedule');
  await writeFile(new URL('../src/ticket-events.json', import.meta.url), JSON.stringify(events, null, 2) + '\n');
  console.log(`Updated ${events.length} ticket dates from Bilietai.lt.`);
} catch (error) {
  console.warn(`Could not refresh ticket schedule; retaining last verified dates: ${error.message}`);
  if (process.argv.includes('--strict')) process.exitCode = 1;
}
