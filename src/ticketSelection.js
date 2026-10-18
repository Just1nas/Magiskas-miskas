export const TICKET_SERIES_URL = 'https://www.bilietai.lt/series/FOPZN745ZJ/magiskas-miskas-pradzia-patyrimu-spektaklis-visokio-ugio-vaikams';

// ISO timestamps from Bilietai.lt include UTC offsets, including Lithuania's DST change.
export function selectTicketEvent(events, now = Date.now()) {
  return availableTicketEvents(events,now)[0] ?? null;
}
export function availableTicketEvents(events, now = Date.now()) {
  const seen=new Set();
  return events.filter(event => event.status === 'ON_SALE' &&
    Number.isFinite(Date.parse(event.eventStartAt)) && Date.parse(event.eventEndAt) > now)
    .sort((a, b) => Date.parse(a.eventStartAt) - Date.parse(b.eventStartAt))
    .filter(event=>{if(seen.has(event.id))return false;seen.add(event.id);return true;});
}
