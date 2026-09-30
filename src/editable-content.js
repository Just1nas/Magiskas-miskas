import { content } from './content.js';
import { safeHttps } from './integrations.js';
// Snapshot before bootstrap applies the saved document. Public fallback and editor share one schema.
const defaults = structuredClone(content);
export const fields = {
  name:'Svetainės pavadinimas', tagline:'Pagrindinis šūkis', description:'Trumpas aprašymas', city:'Miestas', date:'Data', pause:'Didžioji frazė', story:'Miško istorija', venue:'Renginio vieta', address:'Adresas', duration:'Trukmė', hours:'Darbo laikas', contactEmail:'Kontaktinis el. paštas', reviewUrl:'Atsiliepimų nuoroda',
  copy:'Antraštės ir mygtukai', season:'Sezonas', appearance:'Išvaizda', socials:'Socialiniai tinklai', tickets:'Bilietai', ticketTypes:'Bilietų tipai', instagram:'Instagram galerija', map:'Žemėlapis', journey:'Miško erdvės', practical:'Praktinė informacija', transport:'Atvykimo būdai', faq:'D.U.K.', final:'Baigiamasis kvietimas',
  first:'Pirma eilutė',second:'Antra eilutė',title:'Pavadinimas',cue:'Trumpas kvietimas',text:'Aprašymas',detail:'Baigiamoji frazė',id:'Nuorodos identifikatorius',
  mode:'Sezono būsena',closedMessage:'Žinutė pasibaigus sezonui',background:'Fonas',motion:'Subtilios svetainės animacijos',facebook:'Facebook nuoroda',tiktok:'TikTok nuoroda',url:'Renginio nuoroda Bilietai.lt',widgetId:'Bilietai.lt valdiklio ID',eventId:'Bilietai.lt renginio ID',provider:'Bilietai.lt parduotuvės kodas',iframeUrl:'Alternatyvaus bilietų įterpinio URL',price:'Kainų informacija',fallbackUrl:'Atsarginė Bilietai.lt nuoroda',profileUrl:'Instagram paskyros nuoroda',endpoint:'Galerijos duomenų JSON adresas',refreshMs:'Duomenų atnaujinimas (milisekundėmis)',limit:'Rodomų įrašų skaičius',autoplay:'Automatinis galerijos judėjimas',intervalMs:'Galerijos judėjimo intervalas (milisekundėmis)',directionsUrl:'Maršruto nuoroda',embedUrl:'Google žemėlapio įterpinio URL',
  heroFirst:'Didysis pavadinimas: pirma eilutė',heroSecond:'Didysis pavadinimas: antra eilutė',heroLabel:'Hero antraštė',heroLocation:'Hero vietos prierašas',buy:'Bilieto mygtukas',closedButton:'Mygtukas pasibaigus sezonui',enter:'Įžengimo mygtukas',navJourney:'Navigacija: miško erdvės',navArrival:'Navigacija: atvykimas',navFaq:'Navigacija: D.U.K.',pauseLabel:'Frazės skilties antraštė',pauseBottom:'Frazės skilties pabaiga',journeyTitle:'Miško erdvių antraštė',journeyIntro:'Miško erdvių įžanga',journeyNext:'Miško erdvių apačios tekstas',instagramLabel:'Instagram skilties žyma',instagramTitle:'Instagram antraštė',instagramEmpty:'Tekstas, kai nėra įrašų',galleryLabel:'Galerijos valdiklių tekstas',overviewTitle:'Trumpos informacijos antraštė',experienceLabel:'Patyrimo žyma',experience:'Patyrimo aprašymas',audienceLabel:'Auditorijos žyma',audience:'Kam skirtas renginys',durationLabel:'Trukmės žyma',venueLabel:'Vietos žyma',ticketsLabel:'Bilietų skilties žyma',ticketsTitle:'Bilietų antraštė',ticketsIntro:'Bilietų įžanga',ticketsDirect:'Tiesioginės bilietų nuorodos tekstas',closedIntro:'Tekstas po sezono',practicalLabel:'Praktinės informacijos žyma',practicalTitle:'Praktinės informacijos antraštė',whenLabel:'Datos žyma',whereLabel:'Adreso žyma',arrivalTitle:'Atvykimo antraštė',mapLabel:'Žemėlapio žyma',planTrip:'Kelionės planavimo nuorodos tekstas',directions:'Maršruto nuorodos tekstas',openMap:'Žemėlapio nuorodos tekstas',faqTitle:'D.U.K. antraštė',faqMore:'Daugiau klausimų',faqLess:'Mažiau klausimų',contact:'Kontaktų nuorodos tekstas',review:'Atsiliepimų nuorodos tekstas',backTop:'Grįžimo į pradžią tekstas',
};
export const groups = [
  {name:'Pradžia',keys:['name','tagline','description','city','date','pause','story']},
  {name:'Antraštės ir mygtukai',keys:['copy']},
  {name:'Miško erdvės',keys:['journey']},
  {name:'Informacija ir atvykimas',keys:['venue','address','duration','hours','practical','transport','map']},
  {name:'Bilietai',keys:['tickets','ticketTypes']},
  {name:'Instagram ir kontaktai',keys:['instagram','socials','contactEmail','reviewUrl']},
  {name:'D.U.K.',keys:['faq']}, {name:'Pabaiga',keys:['final']},
  {name:'Sezonas ir išvaizda',keys:['season','appearance']},
];
export const choices = {'season.mode':[['upcoming','Artėja'],['live','Vyksta'],['closed','Pasibaigė']], 'appearance.background':[['colors','Spalvinis fonas'],['photo','Pateikta miško nuotrauka']]};
export const hints = {
  'tickets.widgetId':'Tuščias laukas išjungia valdiklį; lieka tiesioginė bilietų nuoroda.',
  'tickets.eventId':'Keičiant renginį atnaujink ir renginio nuorodą, ir šį ID.',
  'instagram.profileUrl':'Keičia paskyros nuorodą. Automatinio įrašų šaltinio paskyrą keičia svetainės prižiūrėtojas.',
  'instagram.endpoint':'Numatytasis šaltinis: ./instagram/feed.json. Čia nerašyk prisijungimo raktų ar slaptažodžių.',
  'instagram.refreshMs':'300000 = 5 minutės. Mažiausia reikšmė 60000.',
  'instagram.intervalMs':'6500 = 6,5 sekundės. Judėjimas gerbia lankytojo mažesnio judesio pasirinkimą.',
  'map.embedUrl':'Įklijuok tik iframe src nuorodą, ne visą HTML kodą.',
};
export function editableDefaults(){return structuredClone(defaults);}
export function newItem(key){
  if(key==='journey') return {id:`erdve-${crypto.randomUUID()}`,title:'Nauja erdvė',cue:'',text:'',detail:''};
  if(key==='ticketTypes') return 'Naujas bilieto tipas';
  return key==='transport'?['Naujas atvykimo būdas','','']:['Naujas įrašas',''];
}
const ranges={'instagram.limit':[3,5],'instagram.refreshMs':[60000,86400000],'instagram.intervalMs':[3000,60000]};
const urlHosts={'socials.facebook':['facebook.com'],'socials.tiktok':['tiktok.com'],'instagram.profileUrl':['instagram.com'],'tickets.url':['bilietai.lt'],'tickets.iframeUrl':['bilietai.lt'],'tickets.fallbackUrl':['bilietai.lt'],'map.embedUrl':['google.com']};
const urlPaths=new Set([...Object.keys(urlHosts),'map.directionsUrl','reviewUrl']);
function fail(path,reason){throw new Error(`${fields[path.split('.').at(-1)]||path}: ${reason}`);}
function check(value,template,path){
  path = path.replace(/^translations\.en\./, '');
  if(Array.isArray(template)) {
    if(!Array.isArray(value)||value.length<1||value.length>(path==='journey'?20:50))fail(path,'reikia 1–'+(path==='journey'?20:50)+' įrašų.');
    if(['faq','practical','transport'].includes(path))return value.map((row,i)=>{
      if(!Array.isArray(row)||row.length<2||row.length>(path==='transport'?3:2))fail(path,'netinkama įrašo struktūra.');
      const pair=row.map((v,j)=>check(v,'',`${path}.${i}.${j}`));
      if(path==='transport'&&pair[2]&&!safeHttps(pair[2]))fail(path,'nuoroda turi prasidėti https://.');
      return pair;
    });
    const rows=value.map((v,i)=>check(v,template[0],`${path}.${i}`));
    if(path==='journey'&&new Set(rows.map(x=>x.id)).size!==rows.length)fail(path,'erdvių identifikatoriai turi būti skirtingi.');
    return rows;
  }
  if(template&&typeof template==='object'){
    if(!value||Array.isArray(value)||typeof value!=='object')fail(path,'netinkamas formatas.');
    for(const key of Object.keys(value))if(!Object.hasOwn(template,key))fail(path,'nežinomas laukas '+key);
    return Object.fromEntries(Object.entries(template).map(([k,t])=>[k,Object.hasOwn(value,k)?check(value[k],t,path?`${path}.${k}`:k):structuredClone(t)]));
  }
  if(typeof value!==typeof template)fail(path,'netinkamas reikšmės tipas.');
  if(typeof value==='boolean')return value;
  if(typeof value==='number'){
    const [min,max]=ranges[path]||[0,100000];
    if(!Number.isInteger(value)||value<min||value>max)fail(path,`įvesk skaičių nuo ${min} iki ${max}.`);
    return value;
  }
  if(value.length>10000)fail(path,'tekstas per ilgas.');
  if(choices[path]&&!choices[path].some(([key])=>key===value))fail(path,'pasirink reikšmę iš sąrašo.');
  if(urlPaths.has(path)&&value&&!safeHttps(value,urlHosts[path]))fail(path,'netinkama arba nepalaikoma HTTPS nuoroda.');
  if(path==='instagram.endpoint'&&value&&value!=='./instagram/feed.json'&&!(/^\/(?!\/)[\w/.-]+(?:\?[\w=&%-]*)?$/.test(value))&&!safeHttps(value))fail(path,'naudok HTTPS arba vietinį JSON adresą.');
  if(path==='contactEmail'&&value&&!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(value))fail(path,'netinkamas el. paštas.');
  if((/^journey\.\d+\.id$/.test(path)||['tickets.widgetId','tickets.eventId','tickets.provider'].includes(path))&&value&&!/^[a-zA-Z0-9_-]{1,100}$/.test(value))fail(path,'leidžiamos lotyniškos raidės, skaičiai, brūkšniai ir pabraukimai.');
  if(/^journey\.\d+\.id$/.test(path)&&!value)fail(path,'identifikatorius būtinas.');
  return value;
}
export function validateEdits(input){
  if(!input||Array.isArray(input)||typeof input!=='object')throw new Error('Netinkamas turinio formatas.');
  // Partial old documents remain supported; nested new fields inherit defaults.
  const result={};
  for(const [key,value] of Object.entries(input)){
    if(!Object.hasOwn(defaults,key))throw new Error('Nežinomas laukas: '+key);
    result[key]=check(value,defaults[key],key);
  }
  if(new TextEncoder().encode(JSON.stringify(result)).length>=131072)throw new Error('Turinys per didelis (128 KB riba).');
  return result;
}
export function mergeEdits(input){return {...editableDefaults(),...validateEdits(input)};}
