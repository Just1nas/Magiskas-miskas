import React,{useEffect,useRef,useState} from 'react';
import {ui,locale} from './locale';
import './reviews.css';
async function request(path,options={}){
 const response=await fetch('/api/reviews'+path,{credentials:'same-origin',cache:'no-store',...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});
 const data=await response.json();if(!response.ok)throw Object.assign(new Error(data.error||ui('Nepavyko susisiekti. Bandyk dar kartą.','Unable to connect. Please try again.')),{status:response.status});return data;
}
export function Reviews(){
 const [reviews,setReviews]=useState([]),[total,setTotal]=useState(0),[cursor,setCursor]=useState(null),[shown,setShown]=useState(3);
 const [name,setName]=useState(''),[text,setText]=useState(''),[website,setWebsite]=useState(''),[formToken,setFormToken]=useState('');
 const [status,setStatus]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[failed,setFailed]=useState(false),[newId,setNewId]=useState('');
 const expanded=useRef(false),alive=useRef(true);
 async function token(){const data=await request('/form');if(alive.current)setFormToken(data.token);}
 async function load(){const data=await request('');if(!alive.current)return;setReviews(data.reviews);setTotal(data.total);setCursor(data.nextCursor);setFailed(false);}
 useEffect(()=>{
  alive.current=true;async function start(){try{await token();}catch{if(alive.current)setStatus(ui('Formos įkelti nepavyko. Bandyk dar kartą.','Unable to load the form. Please try again.'));}try{await load();}catch{if(alive.current)setFailed(true);}finally{if(alive.current)setLoading(false);}}
  start();const timer=setInterval(()=>{if(document.visibilityState==='visible'&&!expanded.current)load().catch(()=>{});},30000);
  return()=>{alive.current=false;clearInterval(timer);};
 },[]);
 async function publish(event){
  event.preventDefault();if(busy||!formToken)return;setBusy(true);setStatus('');
  try{
   const data=await request('',{method:'POST',body:JSON.stringify({name,text,website,token:formToken})});
   setReviews(old=>[data.review,...old.filter(p=>p.id!==data.review.id)]);setNewId(data.review.id);setShown(n=>Math.max(n,3));setName('');setText('');setWebsite('');
   setStatus(ui('Ačiū! Tavo atsiliepimas jau matomas visiems.','Thank you! Your review is now visible to everyone.'));
   if(!expanded.current)await load().catch(()=>{});
   setFormToken('');await token().catch(()=>{});
  }catch(error){setStatus(locale==='en'?'Your review was not posted. Please check the form and try again.':error.message);if(error.status===410)await token().catch(()=>{});}
  finally{setBusy(false);}
 }
 async function more(){
  if(shown<reviews.length){setShown(n=>n+5);return;}if(!cursor||busy)return;
  setBusy(true);try{const data=await request('?before='+encodeURIComponent(cursor));expanded.current=true;setReviews(old=>{const ids=new Set(old.map(p=>p.id));return [...old,...data.reviews.filter(p=>!ids.has(p.id))]});setCursor(data.nextCursor);setTotal(data.total);setShown(n=>n+5);}catch{setStatus(ui('Senesnių atsiliepimų įkelti nepavyko. Bandyk dar kartą.','Unable to load older reviews. Please try again.'));}finally{setBusy(false);}
 }
 async function withdraw(id){
  if(!confirm(ui('Pašalinti tavo atsiliepimą iš viešos svetainės?','Remove your review from the public website?')))return;
  setBusy(true);try{await request('/'+id+'/withdraw',{method:'POST',body:'{}'});setReviews(old=>old.filter(p=>p.id!==id));setTotal(n=>Math.max(0,n-1));setStatus(ui('Tavo atsiliepimas pašalintas.','Your review has been removed.'));}catch{setStatus(ui('Pašalinti nepavyko. Bandyk dar kartą.','Unable to remove the review. Please try again.'));}finally{setBusy(false);}
 }
 return <section id="atsiliepimai" className="section reviews-preview public-reviews" aria-labelledby="reviews-heading">
  <div className="reviews-heading"><div><span className="eyebrow">{ui('Jūsų patirtys','Your experiences')}</span><h2 id="reviews-heading">{ui('Miškas palieka','The forest leaves')}<br/>{ui('pėdsaką.','a lasting impression.')}</h2></div><p className="reviews-intro">{ui('Kiekvienas iš Miško parsineša savo istoriją. Čia — jūsų nuostaba, atradimai ir maži stebuklai.','Everyone takes their own story home from the forest. Share your discoveries, moments of wonder and little miracles here.')}</p></div>
  <div className="reviews-layout"><form className="review-form" onSubmit={publish}>
   <h3>{ui('Ką parsinešei iš Miško?','What did you take home from the forest?')}</h3><p>{ui('Mažą nuostabą? Didelę šypseną? Pasidalink savo įspūdžiu.','A little wonder? A big smile? Tell us about your visit.')}</p>
   <label htmlFor="review-name">{ui('Tavo vardas','Your first name')}</label><input id="review-name" autoComplete="given-name" value={name} placeholder={ui('Kaip tave vadinti?','What should we call you?')} onChange={e=>setName(e.target.value)} maxLength={40} required/>
   <label htmlFor="review-text">{ui('Tavo atsiliepimas','Your review')}</label><textarea id="review-text" value={text} placeholder={ui('Kas nustebino, sužavėjo, įsiminė…','What surprised you, delighted you, stayed with you…')} onChange={e=>setText(e.target.value)} minLength={5} maxLength={800} rows={4} required/>
   <div className="review-trap" aria-hidden="true"><label htmlFor="review-website">Website</label><input id="review-website" value={website} onChange={e=>setWebsite(e.target.value)} autoComplete="off" tabIndex={-1}/></div>
   <div className="review-input-note"><span>{ui('Be registracijos','No registration')}</span><span>{text.length} / 800</span></div>
   <button type="submit" className="review-submit" disabled={busy||!formToken}>{busy?ui('Siunčiama…','Posting…'):ui('Paskelbti atsiliepimą','Post your review')}<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button>
   <p className="review-privacy">{ui('Paskelbus tavo vardas ir atsiliepimas iškart bus matomi viešai. Nesidalink asmens duomenimis ar reklaminėmis nuorodomis.','Your name and review will be public immediately after posting. Please do not share personal details or advertising links.')}</p>
   {!formToken&&!loading&&<button type="button" className="reviews-reset" onClick={()=>token().catch(()=>setStatus(ui('Formos įkelti nepavyko. Perkrauk puslapį.','Unable to load the form. Please reload the page.')))}>{ui('Įkelti formą iš naujo','Reload the form')}</button>}
   <p className="review-status" role="status">{status}</p>
  </form><div className="reviews-list-wrap"><div className="reviews-list-heading"><span>{ui('Miško aidai','Echoes of the forest')}</span><span>{total.toString().padStart(2,'0')}</span></div>
   {loading?<p className="reviews-empty" role="status">{ui('Ieškome Miško aidų…','Listening for echoes…')}</p>:failed?<div className="reviews-empty"><p>{ui('Atsiliepimų įkelti nepavyko.','Unable to load reviews.')}</p><button type="button" onClick={()=>load().catch(()=>setFailed(true))}>{ui('Bandyti dar kartą','Try again')}</button></div>:reviews.length===0?<p className="reviews-empty">{ui('Miškas dar laukia pirmojo įspūdžio. Gal jis bus tavo?','The forest is waiting for its first review. Will it be yours?')}</p>:null}
   <div className="reviews-list" aria-label={ui('Lankytojų atsiliepimai','Visitor reviews')}>{reviews.slice(0,shown).map(post=><article key={post.id} className={`review-entry${newId===post.id?' review-entry-new':''}`}><span className="review-quote" aria-hidden="true">“</span><div><p className="review-text">{post.text}</p><div className="review-byline"><span className="review-avatar" aria-hidden="true">{post.name.slice(0,1).toLocaleUpperCase()}</span><strong>{post.name}</strong><time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString(locale==='en'?'en-GB':'lt-LT',{day:'numeric',month:'short'})}</time></div>{post.mine&&<button className="review-withdraw" type="button" disabled={busy} onClick={()=>withdraw(post.id)}>{ui('Pašalinti mano atsiliepimą','Remove my review')}</button>}</div></article>)}</div>
   {(shown<reviews.length||cursor)&&<button type="button" className="reviews-more" disabled={busy} onClick={more}>{ui('Rodyti daugiau atsiliepimų','Show more reviews')}</button>}
  </div></div>
 </section>;
}
