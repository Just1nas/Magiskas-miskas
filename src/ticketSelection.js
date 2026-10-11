export const TICKET_SERIES_URL = 'https://www.bilietai.lt/series/FOPZN745ZJ/magiskas-miskas-pradzia-patyrimu-spektaklis-visokio-ugio-vaikams';

// ISO timestamps from Bilietai.lt include UTC offsets, including Lithuania's DST change.
export function selectTicketEvent(events, now = Date.now()) {
  return events.filter(event => event.status === 'ON_SALE' &&
    Number.isFinite(Date.parse(event.eventStartAt)) && Date.parse(event.eventEndAt) > now)
    .sort((a, b) => Date.parse(a.eventStartAt) - Date.parse(b.eventStartAt))[0] ?? null;
}
