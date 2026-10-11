import test from 'node:test';
import assert from 'node:assert/strict';
import { selectTicketEvent } from '../src/ticketSelection.js';
const events = [
 {id:'XTDEEDIFT4',eventStartAt:'2026-10-11T14:45:00Z',eventEndAt:'2026-10-11T19:00:00Z',status:'ON_SALE'},
 {id:'SXVCG5HCBQ',eventStartAt:'2026-10-15T14:45:00Z',eventEndAt:'2026-10-15T19:00:00Z',status:'ON_SALE'},
 {id:'DPNI7I66TC',eventStartAt:'2026-10-25T15:45:00Z',eventEndAt:'2026-10-25T20:00:00Z',status:'ON_SALE'},
];
test('keeps today until its exact end and skips days without events', () => {
  assert.equal(selectTicketEvent(events, Date.parse('2026-10-11T18:59:59Z')).id, 'XTDEEDIFT4');
  assert.equal(selectTicketEvent(events, Date.parse('2026-10-11T19:00:00Z')).id, 'SXVCG5HCBQ');
  assert.equal(selectTicketEvent(events, Date.parse('2026-10-14T12:00:00Z')).id, 'SXVCG5HCBQ');
});
test('respects DST timestamps and never falls back to an expired event', () => {
  assert.equal(selectTicketEvent(events, Date.parse('2026-10-25T19:30:00Z')).id, 'DPNI7I66TC');
  assert.equal(selectTicketEvent(events, Date.parse('2026-10-25T20:00:00Z')), null);
});
test('ignores cancelled events and sorts unsorted data', () => {
  const input = events.map(event => ({ ...event })).reverse();
  input.find(e => e.id === 'XTDEEDIFT4').status = 'CANCELLED';
  assert.equal(selectTicketEvent(input, Date.parse('2026-10-11T12:00:00Z')).id, 'SXVCG5HCBQ');
});
