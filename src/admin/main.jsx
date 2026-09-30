import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { fields, editableDefaults, validateEdits } from '../editable-content.js';
import { cmsUrl, cmsKey, cmsConfigured } from '../cms-config.js';
import './style.css';
const client = cmsConfigured ? createClient(cmsUrl, cmsKey, { auth: { flowType: 'pkce' } }) : null;
const demo = ['localhost','127.0.0.1'].includes(location.hostname) && new URLSearchParams(location.search).get('perziura') === '1';
const groups = ['Pradžia', 'Miško erdvės', 'Informacija', 'D.U.K.', 'Pabaiga'];
function Admin() {
  const [session, setSession] = useState(null), [ready,setReady] = useState(!client), [allowed,setAllowed] = useState(demo);
  const [email,setEmail] = useState(''), [message,setMessage] = useState(''), [busy,setBusy] = useState(false);
  const [document,setDocument] = useState(editableDefaults), [saved,setSaved] = useState(null), [revision,setRevision] = useState(0), [group,setGroup] = useState(0);
  const dirty = saved !== null && JSON.stringify(document) !== saved;
  useEffect(() => {
    if (!client) return;
    client.auth.getSession().then(({data,error}) => { if(error) setMessage('Prisijungimas nepavyko. Paprašyk naujos nuorodos.'); setSession(data.session); setReady(true); });
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
        const value = {...editableDefaults(), ...validateEdits(data.content)};
        setDocument(value); setSaved(JSON.stringify(value)); setRevision(data.revision); setAllowed(true); setMessage('');
      } catch {setMessage('Nepavyko įkelti tekstų. Perkrauk puslapį ir bandyk dar kartą.');}
    })();
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
    if (demo) {setMessage('Tai panelės peržiūra. Tekstai viešoje svetainėje nepakeisti.'); return;}
    setBusy(true); setMessage('');
    try {
      const value = validateEdits(document);
      const {data,error} = await client.from('site_content').update({content:value,revision:revision+1}).eq('slug','main').eq('revision',revision).select('revision').maybeSingle();
      if(error) throw error;
      if(!data) {setMessage('Kitas redaktorius jau pakeitė tekstus. Nukopijuok savo pakeitimus ir perkrauk puslapį, kad jų neperrašytum.'); return;}
      setSaved(JSON.stringify(document)); setRevision(data.revision); setMessage('Išsaugota. Atnaujinus svetainės puslapį bus rodomi nauji tekstai.');
    } catch {setMessage('Nepavyko išsaugoti. Pakeitimai liko laukeliuose – patikrink ryšį ir bandyk dar kartą.');} finally {setBusy(false);}
  }
  function update(path,value) {setDocument(old => {const next=structuredClone(old);let node=next;path.slice(0,-1).forEach(key=>node=node[key]);node[path.at(-1)]=value;return next;});}
  function field(label,path,long=false) {
    let value=document; path.forEach(key=>value=value[key]);
    const id=path.join('-');
    return <label key={id} htmlFor={id}>{label}{long ? <textarea id={id} rows={4} maxLength={10000} value={value} onChange={e=>update(path,e.target.value)}/> : <input id={id} maxLength={10000} value={value} onChange={e=>update(path,e.target.value)}/>}</label>;
  }
  return <div className="admin"><header><a href="/">Magiškas Miškas <span>↗</span></a><span>Turinio redagavimas</span>{session && <button onClick={async()=>{if(dirty&&!confirm('Yra neišsaugotų pakeitimų. Atsijungti?'))return; await client.auth.signOut();setAllowed(false);setSaved(null);}}>Atsijungti</button>}</header>
    {!ready ? <main><p>Tikrinamas prisijungimas…</p></main> : !allowed ? <main className="login"><p className="eyebrow">Tik pakviestiems redaktoriams</p><h1>Labas, miško<br/>pasakotojau.</h1><p>Prisijunk ir redaguok svetainės tekstus.</p>{!client ? <p className="notice">Panelė paruošta prijungimui. Prisijungimas bus aktyvuotas prijungus turinio saugojimo paslaugą.</p> : !session ? <form onSubmit={login}><label>El. paštas<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><button className="primary" disabled={busy}>{busy?'Siunčiama…':'Gauti prisijungimo nuorodą'}</button></form> : <p>Redagavimo teisės tikrinamos pagal pakviestų žmonių sąrašą.</p>}<p role="status">{message}</p></main> : <>
    {demo && <div className="notice">Panelės peržiūra · išsaugojimas viešoje svetainėje dar neprijungtas.</div>}
    <div className="workspace"><nav aria-label="Redagavimo skiltys">{groups.map((name,i)=><button key={name} aria-current={group===i?'page':undefined} onClick={()=>{setGroup(i);window.scrollTo({top:0,behavior:"instant"});}}>{name}</button>)}<a href="/" target="_blank" rel="noopener noreferrer">Atidaryti svetainę ↗</a></nav><main><div className="toolbar"><div><p className="eyebrow">Magiško Miško tekstai</p><h1>{groups[group]}</h1></div><button className="primary" disabled={busy||(!demo&&!dirty)} onClick={save}>{busy?'Saugoma…':demo?'Išbandyti išsaugojimą':'Išsaugoti'}</button></div><p className="status" role="status">{message || (dirty?'Yra neišsaugotų pakeitimų.':'Pasirink laukelį ir redaguok tekstą.')}</p><fieldset disabled={busy}>
    {group===0 && ['tagline','description','city','date','pause','story'].map(key=>field(fields[key],[key],['description','story','pause'].includes(key)))}
    {group===1 && document.journey.map((zone,i)=><section key={zone.id}><h2>{zone.title}</h2>{[['title','Pavadinimas'],['cue','Trumpas kvietimas'],['text','Aprašymas'],['detail','Baigiamoji frazė']].map(([key,label])=>field(label,['journey',i,key],key==='text'))}</section>)}
    {group===2 && <>{['venue','address','duration','hours'].map(key=>field(fields[key],[key]))}{['practical','transport'].map(key=><section key={key}><h2>{key==='practical'?'Praktinė informacija':'Kaip atvykti'}</h2>{document[key].map((row,i)=><section key={i}>{field('Pavadinimas',[key,i,0])}{field('Tekstas',[key,i,1],true)}</section>)}</section>)}</>}
    {group===3 && <>{document.faq.map((row,i)=><section key={i}>{field('Klausimas',['faq',i,0])}{field('Atsakymas',['faq',i,1],true)}<button disabled={document.faq.length<=1} onClick={()=>{if(confirm('Pašalinti šį klausimą?'))setDocument(old=>({...old,faq:old.faq.filter((_,n)=>n!==i)}));}}>Pašalinti klausimą</button></section>)}<button disabled={document.faq.length>=50} onClick={()=>setDocument(old=>({...old,faq:[...old.faq,['Naujas klausimas','']]}))}>+ Pridėti klausimą</button></>}
    {group===4 && <>{field('Pirma eilutė',['final','first'])}{field('Antra eilutė',['final','second'])}</>}
    </fieldset></main></div></>}
  </div>;
}
createRoot(document.getElementById('root')).render(<Admin/>);
