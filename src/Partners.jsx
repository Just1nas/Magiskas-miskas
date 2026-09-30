import { ui, locale } from './locale';
import React from 'react';
import './partners.css';

// Original supplied assets; crop only their transparent canvas in CSS.
const groups = [
  { title: ui('Organizuoja','Organised by'), logos: [
    ['kaukiu-akademija', 'Kaukių akademija', 2177, 917, 0, 0, 2177, 917],
  ]},
  { title: ui('Partneriai','Partners'), logos: [
    ['young-living', 'Young Living Brand Partner', 4000, 2000, 305, 424, 3686, 1436],
    ['ecoservice', 'Ecoservice', 6301, 928, 0, 0, 6301, 928],
    ['bps', 'BPS', 1280, 597, 0, 0, 1280, 597],
    ['mediaka', 'Media KA', 2105, 999, 0, 0, 2105, 999],
    ['vu-botanikos-sodas', 'Vilniaus universiteto botanikos sodas', 2421, 1098, 299, 169, 2177, 977],
    ['lrt-vaikai', 'LRT Vaikai', 2163, 1440, 224, 425, 1936, 1015],
  ]},
  { title: ui('Draugai','Friends'), logos: [
    ['adam-lights', 'AdamLights', 6000, 2100, 610, 448, 5482, 1550],
    ['artpro', 'Artpro', 4141, 1183, 0, 0, 4141, 1183],
    ['brotents', 'Brotents', 1000, 600, 11, 112, 989, 513],
    ['kino-sirses', 'Kino širšės', 667, 898, 49, 40, 605, 819],
    ['cine-service', 'Cine Service', 469, 469, 33, 120, 433, 346],
    ['sdg', 'SDG', 5692, 3200, 650, 635, 5355, 2156],
  ]},
];

// Public destinations checked when adding the partner links.
const websites = {
  'kaukiu-akademija': 'https://www.facebook.com/kaukiuakademija',
  'young-living': 'https://www.youngliving.com/lt_lt/',
  ecoservice: 'https://ecoservice.lt/',
  bps: 'https://www.bps.lt/lt/',
  mediaka: 'https://www.facebook.com/kaukiuakademija',
  'vu-botanikos-sodas': 'https://www.botanikos-sodas.vu.lt/',
  'lrt-vaikai': 'https://www.lrt.lt/vaikams',
  'adam-lights': 'https://www.adam.lt/',
  artpro: 'https://www.artpro.lt/lt/',
  brotents: 'https://brotents.lt/',
  'cine-service': 'https://cineservice.lt/',
  sdg: 'https://www.sdg.lt/',
};

export function Partners() {
  return <section id="partneriai" className="section partners" aria-labelledby="partners-title">
    <h2 id="partners-title">{ui('Magiją kuriame kartu.','Together, we create magic.')}</h2>
    {groups.map(({title,logos},i)=><div className={`partner-group${i===0?' is-organizer':''}`} key={title}>
      <h3>{title}</h3>
      <ul className="partner-logos">{logos.map(([file,name,w,h,x,y,right,bottom])=>{
        const width=right-x,height=bottom-y;
        const Wrapper=websites[file] ? 'a' : 'span';
        return <li key={file}><Wrapper className="partner-destination" {...(websites[file] ? {href:websites[file],target:"_blank",rel:"noopener noreferrer",'aria-label':`${name} – ${ui('atsidarys naujame skirtuke','opens in a new tab')}`} : {})}><span className="partner-logo" style={{'--ratio':width/height}}>
          <img src={`/partners/${file}.png`} alt={name} width={w} height={h} loading="lazy" decoding="async" style={{width:`${w/width*100}%`,left:`${-x/width*100}%`,top:`${-y/height*100}%`}}/>
        </span></Wrapper></li>;
      })}</ul>
    </div>)}
  </section>;
}
