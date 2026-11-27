'use client';
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
import {useRef,useState,type FormEvent} from 'react';
import {Button} from '@mui/material';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import {FormTextControl} from '../forms/FormField';
import {LoadingIndicator} from '../SiteLoading';
import {useSiteContent} from '../SiteContentProvider';
import {storeRequest,StoreRequestError,storeErrorMessage} from '../../lib/commerce/client';
import type {components} from '../../lib/commerce/contract-types.generated';
import {DeliveryDetails} from './DeliveryPlan';
import styles from './Tracking.module.css';
gsap.registerPlugin(useGSAP);
type S=components['schemas'];
export function OrderTracking(){
 const text=useRuntimeText();
 const {locale,messages}=useSiteContent(),lock=useRef(false),[number,setNumber]=useState(''),[email,setEmail]=useState(''),[result,setResult]=useState<S['CommerceOrderTracking']|null>(null),[proof,setProof]=useState<{orderNumber:string;email:string}|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const root=useRef<HTMLElement>(null);
 useGSAP(()=>{if(result&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)gsap.fromTo('[data-order-step]',{autoAlpha:.35,y:14},{autoAlpha:1,y:0,duration:.6,stagger:.08,ease:'power3.out',clearProps:'transform,opacity,visibility'});},{scope:root,dependencies:[result]});
 const [delivery,setDelivery]=useState<S['CommerceDeliveryTracking']|null>(null);
 const steps=[['confirmed',text("commerce.confirmed")],['processing',text("commerce.processing")],['shipped',text("commerce.shipped")],['delivered',text("commerce.delivered")]] as const;
 async function lookup(event:FormEvent){event.preventDefault();if(lock.current)return;lock.current=true;setBusy(true);setError('');setResult(null);setProof(null);const input={orderNumber:number.trim(),email:email.trim()};try{setDelivery(null);const capability=await storeRequest<S['CommerceDeliveryCapabilities']>(['delivery-capabilities'],{method:'GET'}).catch(e=>{if(e instanceof StoreRequestError&&e.status===404)return null;throw e;});if(capability?.supported){const data=await storeRequest<S['CommerceDeliveryTracking']>(['orders','delivery-lookup'],{body:input});setDelivery(data);setResult(data.order);}else setResult(await storeRequest<S['CommerceOrderTracking']>(['orders','lookup'],{body:input}));setProof(input);}catch(e){setError(e instanceof StoreRequestError&&e.code==='order_not_found'?(text("ui.4baff574c7ab393b")):e instanceof StoreRequestError&&e.code==='rate_limited'?(text("ui.4b28abc87cd06c68")):storeErrorMessage(e,text));}finally{lock.current=false;setBusy(false);}}
 async function download(id:string,filename:string){if(lock.current||!proof)return;lock.current=true;setBusy(true);setError('');try{const response=await fetch('/api/store/order-documents/read',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',cache:'no-store',body:JSON.stringify({...proof,documentId:id}),signal:AbortSignal.timeout(15000)});if(!response.ok||!response.headers.get('content-type')?.startsWith('text/html'))throw new Error();const url=URL.createObjectURL(await response.blob()),link=document.createElement('a');link.href=url;link.download=filename.replace(/[^A-Za-z0-9_-]/g,'_')+'.html';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{setError(text("ui.8cc5a431c8e3d3e5"));}finally{lock.current=false;setBusy(false);}}
 const index=result?.fulfillmentStatus?steps.findIndex(([state])=>state===result.fulfillmentStatus):-1;
 return <section ref={root} className={styles.tracking}><h2>{messages['commerce.orderTracking']}</h2><p>{text("ui.76d41d32d44cade1")}</p>
 <form onSubmit={lookup} className={styles.form} aria-busy={busy}><FormTextControl label={messages['commerce.orderNumber']} value={number} onChange={e=>setNumber(e.target.value)} autoComplete="off" required disabled={busy} slotProps={{htmlInput:{maxLength:100,autoCapitalize:'characters',spellCheck:false,style:{boxSizing:'content-box'}}}}/><FormTextControl label={messages['commerce.email']} type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required disabled={busy} slotProps={{htmlInput:{maxLength:254,style:{boxSizing:'content-box'}}}}/><Button type="submit" variant="contained" disabled={busy}>{text("ui.0bf4be9db0b77735")}</Button></form>
 {busy&&<LoadingIndicator compact/>}{error&&<p role="alert" className={styles.error}>{error}</p>}
 {result&&<section className={styles.result} aria-label={text("ui.b6482b94f45e8575")}><h3>{text("ui.f934f1ef5fcc7b20")} {result.orderNumber}</h3>
 {result.exception&&<p role="status">{result.exception==='paid_unfulfillable'?(text("ui.27983a3ab68e63db")):result.exception==='cancelled'?(text("ui.f58230d0fabea1b1")):result.exception==='refunded'?(text("ui.bc37366c4b5034ea")):(text("ui.d983f2243f6d1161"))}</p>}
 <ol className={styles.steps}>{steps.filter(([state])=>delivery?.delivery?.mode!=='pickup'||state!=='shipped').map(([state,label],i)=>{const recorded=result.steps.find(s=>s.status===state);return <li key={state} data-order-step data-complete={i<=index||undefined} aria-current={state===result.fulfillmentStatus?'step':undefined}><span className={styles.marker} aria-hidden="true"/><span>{delivery?.delivery?.mode==='pickup'&&state==='delivered'?(text("ui.d34844212e3170f2")):label}{recorded&&<time dateTime={recorded.at}>{new Intl.DateTimeFormat(locale,{dateStyle:'medium'}).format(new Date(recorded.at))}</time>}</span></li>;})}</ol>
 {delivery?.delivery&&<><DeliveryDetails plan={delivery.delivery} locale={locale}/>{delivery.events.map((e,i)=><p key={i}>{e.action==='collected'?(text("ui.d34844212e3170f2")):e.action==='shipped'?(text("ui.abfdb4da882c10d0")):(text("ui.3fad405b11bcfeed"))} · {new Intl.DateTimeFormat(locale,{dateStyle:'medium'}).format(new Date(e.at))}{e.shipment&&<> · {e.shipment.carrier} {e.shipment.trackingNumber}{e.shipment.trackingUrl&&<a href={e.shipment.trackingUrl} target="_blank" rel="noopener noreferrer">{text("ui.302df681f1ecbbad")}</a>}</>}</p>)}</>}
 {result.shipment&&<div><p>{text("ui.1f46fbedae5f2916")} : {result.shipment.carrier}{result.shipment.trackingNumber&&<> · {result.shipment.trackingNumber}</>}</p>{result.shipment.trackingUrl&&<a href={result.shipment.trackingUrl} target="_blank" rel="noopener noreferrer">{text("ui.302df681f1ecbbad")}</a>}</div>}
 <ul className={styles.items}>{result.items.map((item,i)=><li key={i}>{item.title}<span>{text("commerce.quantity")} : {item.quantity}</span></li>)}</ul><p>{text("ui.80735eaf73fd119e")} : {new Intl.NumberFormat(locale,{style:'currency',currency:'EUR'}).format(result.totalGross/100)}</p>
 <div className={styles.documents}>{result.documents.map(doc=><Button key={doc.id} disabled={busy} onClick={()=>void download(doc.id,doc.number)}>{doc.kind==='invoice'?(text("ui.3d328213a80f4d79")):doc.kind==='credit_note'?(text("ui.309cfc810dec30c9")):(text("ui.1b9f363d73f36624"))}</Button>)}</div>
 </section>}
 </section>;
}
