// Replace only known launch placeholders; retain all subsequent editor changes.
export const confirmedAccessibility = 'The Botanical Garden entrance has a steep slope. If this is difficult for you, use the entrance on the other side of the garden, marked OUT on the map.';
export const confirmedRain = 'Magiškas Miškas welcomes visitors on rainy evenings too. Wear suitable clothing and footwear, as the event takes place outdoors.';
const replacements = new Map([
 ['Duration to be confirmed','1–2 hours'],
 ['The recommended visit duration will be confirmed before the event.','1–2 hours.'],
 ['Details about path surfaces, pushchairs and mobility access will be confirmed before the event.',confirmedAccessibility],
 ['Path surface and accessibility details are being confirmed and will be announced before ticket sales begin.',confirmedAccessibility],
 ['Come prepared for an outdoor walk. Rules for adverse weather and ticket exchanges will be published with the tickets.',confirmedRain],
]);
export function updateConfirmedEnglish(document) {
 const result=structuredClone(document),en=result.translations?.en;
 if(!en)return result;
 if(en.hours==='Opening hours will be announced soon'&&/\d/.test(result.hours||''))en.hours=result.hours.trim();
 if(en.duration==='Duration to be confirmed'&&/^1\s*[-–]\s*2\s*h\s*$/.test(result.duration||''))en.duration='1–2 hours';
 for(const field of ['practical','faq'])for(const row of en[field]||[]) {
  if(replacements.has(row[1]))row[1]=replacements.get(row[1]);
 }
 const oldTransport=[
  ['By car','Plan your route to M. K. Čiurlionio g. 110, Vilnius. Exact entrance details will be announced before the event.'],
  ['Parking','Parking locations and any restrictions will be confirmed. Please follow the signs on site.'],
  ['Public transport','Check current routes and timetables in the JUDU journey planner.'],
 ];
 if(JSON.stringify(en.transport)===JSON.stringify(oldTransport))en.transport=[
  ['By car','Parking in Vingis Park is limited, so we recommend coming without a car.'],
  ['Public transport','The nearest stops on the Čiurlionio Street side are Vingio parkas and Vinco Pietario. On the Žvėrynas side, use Liubarto tiltas, Kęstučio or Latvių. Check current routes and timetables in the JUDU journey planner.'],
  ['By bicycle or scooter','You can cycle or ride a scooter to Vingis Park, but please leave bicycles and scooters outside the Botanical Garden.'],
 ];
 return result;
}
