"use client";
import {useEffect,useRef,useState} from "react";
import type {PreviewStatus} from "../../lib/presentation/preview-client";
import {pageKeys,type PageKey} from "../../lib/presentation/types";
import styles from "./PreviewShell.module.css";
const labels:Record<PageKey,string>={home:"Accueil",news:"Actualités",artworks:"Œuvres",exhibitions:"Expositions",publications:"Publications",expertise:"Demande d’expertise",contact:"Contact",artworkDetail:"Fiche d’œuvre"};
export function PreviewUnavailable({adminOrigin}:{adminOrigin?:string}={}){return <main className={styles.notice}><h1>Aperçu indisponible ou expiré</h1><p>Retournez dans l’administration et ouvrez un nouvel aperçu du brouillon enregistré.</p>{adminOrigin&&<a href={adminOrigin+"/presentation"} target="_blank" rel="noopener noreferrer">Retour à l’administration</a>}</main>;}
export function PreviewShell({initial,locales,csrfCookie,adminOrigin}:{initial:PreviewStatus;adminOrigin:string;locales:readonly {code:string;label:string}[];csrfCookie:string}){
 const [active,setActive]=useState(true),[closed,setClosed]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(""),[page,setPage]=useState<PageKey>(initial.pageKey),[locale,setLocale]=useState(initial.locale),[width,setWidth]=useState(1440),frame=useRef<HTMLIFrameElement>(null);
 useEffect(()=>{
  const controller=new AbortController();let checking=false;
  const check=async()=>{if(checking)return;checking=true;try{const r=await fetch("/preview/session",{cache:"no-store",signal:AbortSignal.any([controller.signal,AbortSignal.timeout(10000)])});if(!r.ok)throw new Error();const value=await r.json();if(value.revision!==initial.revision||Date.parse(value.expiresAt)<=Date.now())throw new Error();}catch{if(!controller.signal.aborted)setActive(false);}finally{checking=false;}};
  const focus=()=>void check(),interval=window.setInterval(focus,15000);window.addEventListener("focus",focus);window.addEventListener("pageshow",focus);
  return()=>{controller.abort();clearInterval(interval);window.removeEventListener("focus",focus);window.removeEventListener("pageshow",focus);};
 },[initial.revision]);
 async function close(){setBusy(true);setError("");try{const pair=document.cookie.split(";").map(v=>v.trim()).find(v=>v.startsWith(csrfCookie+"=")),csrf=pair?.slice(csrfCookie.length+1)??"";const r=await fetch("/preview/session",{method:"DELETE",headers:{"X-CSRF-Token":csrf},cache:"no-store"});if(!r.ok)throw new Error();setClosed(true);setActive(false);}catch{setError("Fermeture impossible. Réessayez ; votre session administrateur reste active.");}finally{setBusy(false);}}
 if(closed)return <main className={styles.notice}><h1>Aperçu fermé</h1><p>Vous pouvez fermer cet onglet et continuer dans l’administration.</p></main>;
 if(!active)return <PreviewUnavailable adminOrigin={adminOrigin}/>;
 const path=page==="home"?"":page==="artworkDetail"?"artworks/"+initial.artworkId:page;
 return <div className={styles.shell}><header className={styles.toolbar}><div className={styles.identity}><h1 className={styles.title}>Aperçu du brouillon</h1><p className={styles.note}>Version enregistrée {initial.revision} · aucune modification publique</p></div>
  <label className={styles.field}>Page<select aria-label="Page" disabled={initial.pageKey==="artworkDetail"} value={page} onChange={e=>setPage(e.target.value as PageKey)}>{pageKeys.map(key=><option key={key} value={key} disabled={key==="artworkDetail"&&!initial.artworkId}>{labels[key]}</option>)}</select></label>
  <label className={styles.field}>Langue<select aria-label="Langue" disabled={initial.pageKey==="artworkDetail"} value={locale} onChange={e=>setLocale(e.target.value)}>{locales.map(l=><option value={l.code} key={l.code}>{l.label}</option>)}</select></label>
  <label className={styles.field}>Largeur<select aria-label="Largeur" value={width} onChange={e=>setWidth(Number(e.target.value))}><option value={1440}>Ordinateur · 1440 px</option><option value={375}>Mobile · 375 px</option></select></label>
  <button className={styles.button} disabled={busy} onClick={close}>Fermer l’aperçu</button></header>
  {error&&<p role="alert" className={styles.error}>{error}</p>}
  {initial.pageKey==="artworkDetail"&&<p className={styles.note}>Cet aperçu est lié à cette œuvre et à cette langue. Ouvrez un nouvel aperçu depuis l’administration pour les changer.</p>}
  <main className={styles.stage}><iframe ref={frame} title="Rendu du brouillon" className={styles.canvas} style={{width}} src={"/preview/render/"+locale+(path?"/"+path:"")} referrerPolicy="no-referrer" onLoad={()=>{try{if(frame.current?.contentDocument?.querySelector('[data-preview-unavailable]'))setActive(false);}catch{setActive(false);}}}/></main>
 </div>;
}
