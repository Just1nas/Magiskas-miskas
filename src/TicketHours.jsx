import React from 'react';
import {ui} from './locale';

// Confirmed park opening hours, independent of ticket entry slots.
const openingHours = [
  [3, '17:30', '22:00'],
  [4, '17:30', '22:00'],
  [5, '16:30', '21:00'],
  [6, '16:30', '22:00'],
  [7, '16:30', '22:00'],
  [8, '16:30', '21:00'],
];

export function TicketHours() {
  return <div className="ticket-hours">
    <span className="eyebrow">{ui('Apsilankymo datos ir darbo laikas', 'Visit dates and opening hours')}</span>
    <p>{ui('Magiškas Miškas veiks:', 'Magiškas Miškas will be open:')}</p>
    <dl>{openingHours.map(([day, opens, closes]) => <div key={day}>
      <dt>{ui(`Lapkričio ${day} d.`, `${day} November`)}</dt>
      <dd>{opens}–{closes}</dd>
    </div>)}</dl>
  </div>;
}
