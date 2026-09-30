import React from 'react';
import './animatedBrand.css';

// Show three regions of the original artwork; no redrawing or extra image assets.
export function AnimatedBrand({ src, name }) {
  return <span className="animated-brand" role="img" aria-label={name}>
    {['symbol', 'first', 'second'].map(part => <img key={part} className={`brand-part brand-part-${part}`} src={src} alt="" aria-hidden="true" draggable="false" />)}
  </span>;
}
