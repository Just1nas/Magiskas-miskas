import { existsSync, readFileSync } from 'node:fs';
import { content as c } from '../src/content.js';
import { safeHttps } from '../src/integrations.js';
const issues=[];
for(const file of ['public/brand/logo.png','public/brand/symbol.png','public/fonts/Magical-Regular.woff2','public/fonts/Manrope-VariableFont_wght.woff2']){
 if(!existsSync(file))issues.push(`Trūksta ${file}`);
 else if(file.endsWith('.woff2')&&readFileSync(file).subarray(0,4).toString()!=='wOF2')issues.push(`Netinkamas WOFF2: ${file}`);
}
if(!safeHttps(c.instagram.profileUrl,['instagram.com']))issues.push('Įrašyk oficialią Instagram paskyros nuorodą.');
if(c.instagram.mode !== 'profile' && !c.instagram.endpoint)issues.push('Neprijungtas tikrų Instagram įrašų šaltinis.');
if(c.season.mode!=='closed'){
 if(!safeHttps(c.tickets.url,['bilietai.lt']))issues.push('Įrašyk oficialią renginio Bilietai.lt nuorodą.');
 if(/patikslinsime|paskelbsime/i.test(c.hours))issues.push('Patikslink darbo laiką.');
 if(/patikslinsime/i.test(c.duration))issues.push('Patikslink apsilankymo trukmę.');
 if(/paskelbsime/i.test(c.tickets.price))issues.push('Patikslink bilietų kainas.');
}
if(issues.length){console.log('Prieš viešą paleidimą:\n'+issues.map(x=>`- ${x}`).join('\n'));process.exitCode=1;}
else console.log('Pagrindiniai paleidimo laukai užpildyti. Dar peržiūrėk FAQ ir faktinę informaciją.');
