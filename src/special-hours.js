// Confirmed seasonal exception; expires at midnight in Vilnius after 8 November.
export function specialHours(language='lt',now=Date.now()) {
  if(now>=Date.parse('2026-11-09T00:00:00+02:00'))return null;
  return language==='en'
    ? {closed:'Closed 1–2 November',open:'Open daily 3–8 November'}
    : {closed:'Lapkričio 1–2 d. nedirbame',open:'Lapkričio 3–8 d. dirbame kasdien'};
}
