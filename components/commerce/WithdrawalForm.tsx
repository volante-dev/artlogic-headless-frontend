'use client';
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
import {useRef,useState,type FormEvent} from 'react';
import {Button} from '@mui/material';
import {FormTextControl} from '../forms/FormField';
import {useSiteContent} from '../SiteContentProvider';
import {LoadingIndicator} from '../SiteLoading';
import {HeaderLink} from '../header/HeaderLink';
import {localizedPath} from '@/lib/i18n/routes';
import {storeRequest,storeErrorMessage,StoreRequestError} from '@/lib/commerce/client';
import type {components} from '@/lib/commerce/contract-types.generated';
import styles from './Tracking.module.css';
type S=components['schemas'];
export function WithdrawalForm(){
 const text=useRuntimeText();
 const {locale,defaultLocale}=useSiteContent(),[values,setValues]=useState({fullName:'',receiptEmail:'',contractReference:'',declaration:text("ui.27ec68541c4150f2")}),[step,setStep]=useState<'edit'|'review'|'receipt'>('edit'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[receipt,setReceipt]=useState<S['CommerceWithdrawalReceipt']|null>(null),[uncertain,setUncertain]=useState(false),lock=useRef(false),intent=useRef<{body:S['CommerceWithdrawalInput'];key:string}|null>(null);
 function review(event:FormEvent){event.preventDefault();if(lock.current)return;setError('');setStep('review');}
 async function confirm(){if(lock.current)return;lock.current=true;setBusy(true);setError('');const command=intent.current??{body:{...values,locale,confirmed:true as const},key:crypto.randomUUID()};intent.current=command;
  try{await storeRequest(['guest-session'],{body:{locale,purpose:'withdrawal'}});const value=await storeRequest<S['CommerceWithdrawalReceipt']>(['withdrawals'],{body:command.body,key:command.key});setReceipt(value);setStep('receipt');setUncertain(false);}catch(e){setUncertain(e instanceof StoreRequestError&&(e.status===0||e.status>=500));setError(e instanceof StoreRequestError&&e.code==='rate_limited'?(text("ui.f124c77cd172ad1c")):storeErrorMessage(e,text));}finally{lock.current=false;setBusy(false);}
 }
 function download(){if(!receipt)return;const content=[text("ui.374dacede393546b"),receipt.reference,receipt.receivedAt+' UTC',receipt.fullName,receipt.contractReference,receipt.declaration,text("ui.cba1bf6ca9a122d5")].join('\n\n'),url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='withdrawal-'+receipt.reference+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <section className={styles.tracking}><h2>{text("ui.b46606a7fcf25685")}</h2><p>{text("ui.0b5bfff297518eb8")}</p>
 {step==='edit'&&<form onSubmit={review} className={styles.form}>{([{key:'fullName',label:text("ui.296f2ed7068a603a"),max:200},{key:'receiptEmail',label:text("ui.c5bdb1ac13ca64fc"),max:254},{key:'contractReference',label:text("ui.73952b08f5d3271e"),max:2000},{key:'declaration',label:text("ui.6fe336b706acb1c4"),max:10000}] as const).map(field=><FormTextControl key={field.key} label={field.label} value={values[field.key]} onChange={e=>setValues(v=>({...v,[field.key]:e.target.value}))} type={field.key==='receiptEmail'?'email':'text'} required multiline={field.key==='declaration'||field.key==='contractReference'} minRows={field.key==='declaration'?4:undefined} slotProps={{htmlInput:{maxLength:field.max,style:{boxSizing:'content-box'}}}}/>)}<Button type="submit" variant="outlined">{text("ui.95c62aa6bb2dbc0f")}</Button></form>}
 {step==='review'&&<div className={styles.result}><h3>{text("ui.ca7b42fcec6ae903")}</h3><p>{values.fullName}<br/>{values.receiptEmail}</p><p style={{whiteSpace:'pre-wrap'}}>{values.contractReference}</p><p style={{whiteSpace:'pre-wrap'}}>{values.declaration}</p><p>{text("ui.8b68c4c85da70886")}</p><Button disabled={busy} variant="contained" onClick={()=>void confirm()}>{uncertain?(text("ui.b6c576c8a2e402fb")):(text("ui.266c8fdad5bebf70"))}</Button><Button disabled={busy||uncertain} onClick={()=>{intent.current=null;setStep('edit');setError('');}}>{text("ui.a451b8150e303ec4")}</Button></div>}
 {busy&&<LoadingIndicator compact/>}{error&&<p role="alert" className={styles.error}>{error}</p>}
 {step==='receipt'&&receipt&&<section className={styles.result} aria-label={text("ui.374dacede393546b")}><h3>{text("ui.eac42220b22ffa21")}</h3><p>{receipt.reference}</p><time dateTime={receipt.receivedAt}>{new Intl.DateTimeFormat(locale,{dateStyle:'long',timeStyle:'long',timeZone:'UTC'}).format(new Date(receipt.receivedAt))} UTC</time><p style={{whiteSpace:'pre-wrap'}}>{receipt.declaration}</p><p>{text("ui.3dce525ab21c6bcb")}</p><Button onClick={download}>{text("ui.b24ddd3e0aa9b658")}</Button></section>}
 <p>{text("ui.05e1a0d2b64f5d26")} <HeaderLink href={localizedPath('/contact',locale,defaultLocale)}>{text("ui.082a54bc02f3c153")}</HeaderLink>. <HeaderLink href={localizedPath('/terms',locale,defaultLocale)}>{text("ui.830f929e787366b4")}</HeaderLink>.</p></section>;
}
