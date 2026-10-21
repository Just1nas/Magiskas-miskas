import React,{useEffect,useState} from 'react';
import {cmsRequest} from '../hostinger-cms.js';
export function ReviewsAdmin({demo=false}){
 const [reviews,setReviews]=useState([]),[state,setState]=useState('loading'),[busy,setBusy]=useState(''),[message,setMessage]=useState(''),[filter,setFilter]=useState('published');
 async function load(){if(demo){setState('demo');return;}try{const data=await cmsRequest('admin/reviews');setReviews(data.reviews);setState('ready');}catch{setState('error');}}
 useEffect(()=>{load();},[]);
 async function visibility(post){setBusy(post.id);setMessage('');try{await cmsRequest('admin/reviews/'+post.id+'/visibility',{method:'POST',body:{visible:post.status!=='published'}});await load();setMessage(post.status==='published'?'Atsiliepimas paslėptas iš viešos svetainės.':'Atsiliepimas vėl matomas viešai.');}catch(error){setMessage(error.message||'Nepavyko išsaugoti. Bandyk dar kartą.');}finally{setBusy('');}}
 return <div className="review-admin"><p className="eyebrow">Lankytojų įspūdžiai</p><h1>Atsiliepimai</h1><p>Atsiliepimai paskelbiami iškart. Netinkamus įrašus gali paslėpti ir prireikus grąžinti. Autoriaus pašalintų atsiliepimų viešai negrąžiname.</p>
  <div className="review-admin-tools"><label>Rodyti<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="published">Viešus</option><option value="hidden">Paslėptus</option><option value="withdrawn">Autoriaus pašalintus</option><option value="all">Visus</option></select></label><button type="button" onClick={load}>Atnaujinti sąrašą</button></div>
  <p role="status">{message}</p>
  {state==='loading'?<p>Įkeliama…</p>:state==='demo'?<p>Moderavimas veikia prisijungus prie tikros redaktoriaus paskyros.</p>:state==='error'?<p>Nepavyko įkelti atsiliepimų. Bandyk atnaujinti sąrašą.</p>:<><p className="field-help">Naujausi {reviews.length} įrašai. Rodoma: {reviews.filter(p=>filter==='all'||p.status===filter).length}.</p>{reviews.filter(p=>filter==='all'||p.status===filter).map(post=><article key={post.id} className="review-admin-entry"><div><strong>{post.name}</strong><time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString('lt-LT')}</time></div><p>{post.text}</p><span>{post.status==='published'?'Viešas':post.status==='hidden'?'Paslėptas':'Pašalino autorius'}</span>{post.status!=='withdrawn'&&<button type="button" disabled={Boolean(busy)} onClick={()=>visibility(post)}>{busy===post.id?'Saugoma…':post.status==='published'?'Paslėpti iš svetainės':'Grąžinti į svetainę'}</button>}</article>)}</>}
 </div>;
}
