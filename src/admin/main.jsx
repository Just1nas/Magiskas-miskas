import { InstagramStatus } from './InstagramStatus';
import { ArrowIcon } from '../ArrowIcon';
import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { fields, groups, choices, hints, newItem, editableDefaults, validateEdits, mergeEdits } from '../editable-content.js';
import { cmsUrl, cmsKey, cmsConfigured } from '../cms-config.js';
import './style.css';
import { draftKey, encodeDraft, decodeDraft } from './draft.js';
import { authFlow } from './auth-flow.js';
const client = cmsConfigured ? createClient(cmsUrl, cmsKey, { auth: { flowType: authFlow(location.hash) } }) : null;
const demo = ['localhost','127.0.0.1'].includes(location.hostname) && new URLSearchParams(location.search).get('perziura') === '1';
function Admin() {
  const [session, setSession] = useState(null), [ready,setReady] = useState(!client), [allowed,setAllowed] = useState(demo);
  const [email,setEmail] = useState(''), [message,setMessage] = useState(''), [busy,setBusy] = useState(false);
  const [document,setDocument] = useState(editableDefaults), [saved,setSaved] = useState(()=>demo?JSON.stringify(editableDefaults()):null), [revision,setRevision] = useState(0), [group,setGroup] = useState(0);
  const [language,setLanguage] = useState('lt');
  const frame=useRef(null), canvas=useRef(null);
  const [previewSize,setPreviewSize]=useState({width:600,height:560});
  useEffect(()=>{if(!allowed||!canvas.current)return;const observer=new ResizeObserver(([e])=>setPreviewSize({width:e.contentRect.width,height:e.contentRect.height}));observer.observe(canvas.current);return()=>observer.disconnect();},[allowed,ready]);
  const [device,setDevice]=useState('desktop'), [previewReady,setPreviewReady]=useState(false), [draft,setDraft]=useState(null), [draftStatus,setDraftStatus]=useState(''), [previewError,setPreviewError]=useState('');
  const storageKey=draftKey(demo?'demo':session?.user.id||'anonymous');
  const section=['pradzia','pradzia','kelione','atvykimas','bilietai','instagram','duk','pabaiga','pradzia'][group];
  useEffect(()=>{if(!allowed)return;try{setDraft(decodeDraft(localStorage.getItem(storageKey)));}catch{setDraftStatus('Naršyklė neleidžia išsaugoti juodraščio.');}},[allowed,storageKey]);
  useEffect(()=>{
    const receive=e=>{if(e.origin!==location.origin||e.source!==frame.current?.contentWindow)return;if(e.data?.type==='mm-preview-ready')setPreviewReady(n=>Number(n)+1);};
    window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);
  },[]);
  useEffect(()=>{
    if(!allowed||!previewReady)return;
    const timer=setTimeout(()=>{try{const value=validateEdits(document);frame.current?.contentWindow.postMessage({type:'mm-preview-content',content:value,section},location.origin);setPreviewError('');}catch{setPreviewError('Peržiūra rodo paskutinę tinkamą versiją. Patikrink įvestus laukelius.');}},500);
    return()=>clearTimeout(timer);
  },[document,section,previewReady,allowed,language]);
  function saveDraft(){try{localStorage.setItem(storageKey,encodeDraft(document,revision));setDraft(decodeDraft(localStorage.getItem(storageKey)));setDraftStatus('Juodraštis išsaugotas šioje naršyklėje. Vieša svetainė nepakeista.');}catch{setDraftStatus('Juodraščio išsaugoti nepavyko. Patikrink laukelius arba atsisiųsk turinio kopiją.');}}
  function restoreDraft(){if(!draft)return;if(dirty&&!confirm('Pakeisti dabartinius laukelius išsaugotu juodraščiu?'))return;setDocument(draft.content);setDraftStatus(draft.revision!==revision?'Juodraštis atkurtas iš senesnės versijos. Palygink su dabartine svetaine prieš publikuodamas.':'Juodraštis atkurtas. Peržiūrėk prieš publikuodamas.');}
  function discard(){if(!saved||!confirm('Atšaukti pakeitimus ir grįžti prie įkeltos publikuotos versijos?'))return;setDocument(JSON.parse(saved));setMessage('Pakeitimai laukeliuose atšaukti.');}

  const dirty = saved !== null && JSON.stringify(document) !== saved;
  useEffect(() => {
    if (!client) return;
    client.auth.getSession().then(({data,error}) => { if(error) setMessage('Prisijungimas nepavyko. Paprašyk naujos nuorodos.'); setSession(data.session); setReady(true); }).catch(() => {setMessage("Nepavyko patikrinti prisijungimo. Perkrauk puslapį.");setReady(true);});
    const {data:{subscription}} = client.auth.onAuthStateChange((_event,value) => {setSession(value); setReady(true);});
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    let active = true;
    setAllowed(demo);
    if (!session || !client) return;
    (async () => {
      const {data:editor,error} = await client.from('site_editors').select('user_id').eq('user_id',session.user.id).maybeSingle();
      if (!active) return;
      if (error || !editor) {setMessage('Ši paskyra dar neturi redagavimo teisių. Kreipkis į svetainės administratorių.'); return;}
      const {data,error:loadError} = await client.from('site_content').select('content,revision').eq('slug','main').single();
      if (!active) return;
      try {
        if (loadError) throw loadError;
        const value = mergeEdits(data.content);
        setDocument(value); setSaved(JSON.stringify(value)); setRevision(data.revision); setAllowed(true); setMessage('');
      } catch {setMessage('Nepavyko įkelti tekstų. Perkrauk puslapį ir bandyk dar kartą.');}
    })().catch(() => {if(active)setMessage("Nepavyko įkelti tekstų. Patikrink interneto ryšį ir perkrauk puslapį.");});
    return () => {active=false;};
  }, [session?.user.id]);
  useEffect(() => {
    if (!dirty) return;
    const warn = event => { event.preventDefault(); event.returnValue=''; };
    window.addEventListener('beforeunload',warn); return () => window.removeEventListener('beforeunload',warn);
  }, [dirty]);
  async function login(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const {error} = await client.auth.signInWithOtp({email:email.trim(),options:{shouldCreateUser:false,emailRedirectTo:`${location.origin}/gabija/`}});
      setMessage(error ? 'Nuorodos išsiųsti nepavyko. Patikrink, ar tavo el. paštas pakviestas, arba bandyk vėliau.' : 'Patikrink el. paštą. Prisijungimo nuorodą atidaryk šioje naršyklėje.');
    } catch {setMessage('Nepavyko susisiekti. Patikrink interneto ryšį.');} finally {setBusy(false);}
  }
  async function save() {
    setBusy(true); setMessage('');
    try {
      const value = validateEdits(document);
      if (demo) {setMessage('Duomenys patikrinti. Tai peržiūra – vieša svetainė nepakeista.'); return;}
      const {data,error} = await client.from('site_content').update({content:value,revision:revision+1}).eq('slug','main').eq('revision',revision).select('revision').maybeSingle();
      if(error) throw error;
      if(!data) {setMessage('Kitas redaktorius jau pakeitė tekstus. Nukopijuok savo pakeitimus ir perkrauk puslapį, kad jų neperrašytum.'); return;}
      setDocument(value); setSaved(JSON.stringify(value)); setRevision(data.revision); setMessage('Publikuota. Pakeitimai jau matomi atnaujinus svetainę.'); try{localStorage.removeItem(storageKey);setDraft(null);setDraftStatus('');}catch{}
    } catch(error) {setMessage(error instanceof Error ? error.message : 'Nepavyko išsaugoti. Pakeitimai liko laukeliuose – patikrink ryšį.');} finally {setBusy(false);}
  }
  function update(path,value) {setDocument(old => {const next=structuredClone(old);let node=next;path.slice(0,-1).forEach(key=>node=node[key]);node[path.at(-1)]=value;return next;});}
  function move(key,index,direction) {
    setDocument(old=>{const next=structuredClone(old),rows=key.reduce((node,part)=>node[part],next);[rows[index],rows[index+direction]]=[rows[index+direction],rows[index]];return next;});
  }
  function remove(key,index) {
    if(confirm('Pašalinti šį įrašą? Pakeitimas bus paskelbtas tik publikavus.'))update(key,key.reduce((node,part)=>node[part],document).filter((_,i)=>i!==index));
  }
  function renderField(value,path,label) {
    const id=path.join('.'), key=path.at(-1);
    if(Array.isArray(value)) return <section key={id}><h2>{label}</h2>{value.map((row,i)=><section className="editor-row" key={i}>
      <div className="row-tools"><span>Įrašas {i+1}</span><button aria-label={`Perkelti įrašą ${i+1} aukščiau`} disabled={i===0||(language==='en'&&key==='transport')} onClick={()=>move(path,i,-1)}><ArrowIcon direction="up" /></button><button aria-label={`Perkelti įrašą ${i+1} žemiau`} disabled={i===value.length-1||(language==='en'&&key==='transport')} onClick={()=>move(path,i,1)}><ArrowIcon direction="down" /></button><button disabled={value.length<=1||(language==='en'&&key==='transport')} onClick={()=>remove(path,i)}>Pašalinti</button></div>
      {Array.isArray(row)?<>{renderField(row[0],[...path,i,0],key==='faq'?'Klausimas':'Pavadinimas')}{renderField(row[1],[...path,i,1],key==='faq'?'Atsakymas':'Tekstas')}{key==='transport'&&language==='lt'&&renderField(row[2]||'',[...path,i,2],'Nuoroda (nebūtina)')}</>:renderField(row,[...path,i],typeof row==='string'?'Bilieto tipas':'Įrašo turinys')}
    </section>)}<button disabled={value.length>=(key==='journey'?20:50)||(language==='en'&&key==='transport')} onClick={()=>update(path,[...value,newItem(key)])}>+ Pridėti įrašą</button></section>;
    if(value&&typeof value==='object')return <section key={id}><h2>{label}</h2>{Object.entries(value).map(([k,v])=>renderField(v,[...path,k],fields[k]||k))}</section>;
    if(key==='id')return <p className="field-help" key={id}>Nuorodos identifikatorius: {value}</p>;
    const help=hints[id];
    const input=choices[id]?<select id={id} value={value} onChange={e=>update(path,e.target.value)}>{choices[id].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
      :typeof value==='boolean'?<input id={id} type="checkbox" checked={value} onChange={e=>update(path,e.target.checked)}/>
      :typeof value==='number'?<input id={id} type="number" value={value} onChange={e=>update(path,e.target.value===''?'':Number(e.target.value))}/>
      :<textarea id={id} rows={['story','text','description'].includes(key)||typeof key==='number'&&key===1?4:2} maxLength={10000} value={value} onChange={e=>update(path,e.target.value)}/>;
    return <label key={id} htmlFor={id}>{label}{input}{help&&<small className="field-help">{help}</small>}</label>;
  }
  function exportContent(){
    const blob=new Blob([JSON.stringify(document,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=window.document.createElement('a');
    a.href=url;a.download='magiskas-miskas-turinys.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function importContent(event){
    const file=event.target.files?.[0];event.target.value='';if(!file)return;
    try{if(file.size>=131072)throw new Error('Failas per didelis (128 KB).');const next=mergeEdits(JSON.parse(await file.text()));
      if(confirm('Pakeisti laukelių turinį iš failo? Vieša svetainė pasikeis tik paspaudus Publikuoti.')){setDocument(next);setMessage('Kopija įkelta į laukelius. Peržiūrėk ir publikuok.');}
    }catch(error){setMessage('Kopijos įkelti nepavyko. '+error.message);}
  }
  return <div className="admin"><header><a href="/">Magiškas Miškas <span><ArrowIcon direction="out" /></span></a><span>Turinio redagavimas</span>{session && <button onClick={async()=>{if(dirty&&!confirm('Yra neišsaugotų pakeitimų. Atsijungti?'))return; await client.auth.signOut();setAllowed(false);setSaved(null);}}>Atsijungti</button>}</header>
    {!ready ? <main><p>Tikrinamas prisijungimas…</p></main> : !allowed ? <main className="login"><p className="eyebrow">Tik pakviestiems redaktoriams</p><h1>Labas, miško<br/>pasakotojau.</h1><p>Prisijunk ir redaguok svetainės tekstus.</p>{!client ? <p className="notice">Panelė paruošta prijungimui. Prisijungimas bus aktyvuotas prijungus turinio saugojimo paslaugą.</p> : !session ? <form onSubmit={login}><label>El. paštas<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><button className="primary" disabled={busy}>{busy?'Siunčiama…':'Gauti prisijungimo nuorodą'}</button></form> : <p>Redagavimo teisės tikrinamos pagal pakviestų žmonių sąrašą.</p>}<p role="status">{message}</p></main> : <>
    {demo && <div className="notice">Panelės peržiūra · čia atliekami bandymai viešos svetainės nekeičia.</div>}
    <div className="workspace"><nav aria-label="Redagavimo skiltys">{groups.map(({name},i)=><button key={name} aria-current={group===i?'page':undefined} onClick={()=>{setGroup(i);window.scrollTo({top:0,behavior:"instant"});}}>{name}</button>)}<a href="/" target="_blank" rel="noopener noreferrer">Atidaryti svetainę <ArrowIcon direction="out" /></a></nav><main><div className="toolbar"><div><p className="eyebrow">Svetainės turinys</p><h1>{groups[group].name}</h1></div><button className="primary" disabled={busy||(!demo&&!dirty)} onClick={save}>{busy?'Publikuojama…':demo?'Patikrinti publikavimą':'Publikuoti'}</button></div><div className="draft-actions"><button disabled={busy||!dirty} onClick={saveDraft}>Išsaugoti juodraštį</button><button disabled={busy||!dirty} onClick={discard}>Atšaukti pakeitimus</button></div><p className="draft-note">Juodraštis saugomas tik šioje naršyklėje. Viešą svetainę keičia tik „Publikuoti“.</p>{draft&&<div className="draft-banner"><span>Yra juodraštis · {new Date(draft.updatedAt).toLocaleString('lt-LT')}</span><button onClick={restoreDraft}>Atkurti juodraštį</button></div>}<p className="draft-note" role="status">{draftStatus}</p><p className="status" role="status">{message || (dirty?'Yra nepublikuotų pakeitimų.':'Pasirink laukelį ir redaguok tekstą.')}</p><div className="editor-languages" role="group" aria-label="Tekstų kalba"><button aria-pressed={language==='lt'} onClick={()=>{if(language!=='lt'){setPreviewReady(false);setLanguage('lt')}}}>LT · Lietuvių</button><button aria-pressed={language==='en'} onClick={()=>{if(language!=='en'){setPreviewReady(false);setLanguage('en')}}}>EN · English</button><a href={language==='en'?'/en/':'/'} target="_blank" rel="noopener noreferrer">Peržiūrėti {language.toUpperCase()} <ArrowIcon direction="out" /></a></div><p className="field-help">Tekstus redaguok abiem kalbomis. Lietuviški pakeitimai automatiškai neišverčiami. Žemėlapis, nuorodos ir integracijų nustatymai bendri — juos rasi LT skiltyse.</p>{group===5&&<InstagramStatus/>}<fieldset disabled={busy}>
    {groups[group].keys.filter(key=>language==='lt'||Object.hasOwn(document.translations.en,key)).map(key=>renderField(language==='lt'?document[key]:document.translations.en[key],language==='lt'?[key]:['translations','en',key],fields[key]||key))}{language==='en'&&!groups[group].keys.some(key=>Object.hasOwn(document.translations.en,key))&&<p>Šios skilties nustatymai bendri abiem kalboms. Juos redaguok LT skiltyje.</p>}
    <details className="backup-tools"><summary>Papildomi nustatymai ir turinio kopija</summary><h2>Turinio kopija</h2><p>Kopija apima visų skilčių turinį. Įkėlus kopiją, ją dar reikės išsaugoti.</p><button onClick={exportContent}>Atsisiųsti JSON kopiją</button><label>Įkelti turinio kopiją<input type="file" accept="application/json,.json" onChange={importContent}/></label></details>
    </fieldset></main><aside className="live-preview" aria-label="Gyva svetainės peržiūra"><div className="preview-toolbar"><div><strong>Gyva peržiūra</strong><span>Tavo nepublikuoti pakeitimai</span></div><div role="group" aria-label="Peržiūros įrenginys"><button aria-pressed={device==='desktop'} onClick={()=>setDevice('desktop')}>Kompiuteris</button><button aria-pressed={device==='mobile'} onClick={()=>setDevice('mobile')}>Telefonas</button></div></div>{previewError&&<p role="status">{previewError}</p>}<div ref={canvas} className={`preview-canvas ${device}`}><iframe style={device==='desktop'?{width:1200,height:previewSize.height/(previewSize.width/1200),transform:`scale(${previewSize.width/1200})`,transformOrigin:'top left'}:undefined} ref={frame} key={language} title="Svetainės juodraščio peržiūra" src={`${language==='en'?'/en/':'/'}?adminPreview=1#${section}`}/></div></aside></div></>}
  </div>;
}
createRoot(document.getElementById('root')).render(<Admin/>);
