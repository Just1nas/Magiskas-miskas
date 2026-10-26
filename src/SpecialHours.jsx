import React from 'react';
import {locale} from './locale';
import {specialHours} from './special-hours';
import './special-hours.css';
export function SpecialHours(){
 const notice=specialHours(locale);
 return notice?<p className="special-hours"><span>{notice.closed}</span><strong>{notice.open}</strong></p>:null;
}
