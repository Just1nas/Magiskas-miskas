import React from 'react';

// Drawn geometry avoids platform-specific emoji and font substitutions.
export function ArrowIcon({ direction = 'out', size = 20 }) {
  const paths = {
    out: 'M5 19 19 5M5 5h14v14',
    right: 'M4 12h16M13 5l7 7-7 7',
    left: 'M20 12H4M11 5l-7 7 7 7',
    up: 'M12 20V4M5 11l7-7 7 7',
    down: 'M12 4v16M5 13l7 7 7-7',
    replay: 'M4 9a8 8 0 1 1 0 6M4 3v6h6',
  };
  return <svg className="arrow-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" style={{display:'inline-block',verticalAlign:'middle',flexShrink:0}}><path d={paths[direction] || paths.out} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
