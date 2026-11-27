'use client';
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
import {useRef,useState} from 'react';
import {Button} from '@mui/material';
import type {components} from '../../lib/commerce/contract-types.generated';
import {storeRequest,storeErrorMessage} from '../../lib/commerce/client';
import {LoadingIndicator} from '../SiteLoading';
import styles from './Checkout.module.css';
export function MockPayment({attemptId,locale,onResult,onBusyChange}:{attemptId:string;locale:string;onResult:()=>void;onBusyChange:(busy:boolean)=>void}){
 const text=useRuntimeText(locale);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),key=useRef<string|null>(null);
 async function confirm(outcome:'paid'|'declined'){
  if(busy)return;setBusy(true);onBusyChange(true);setError('');key.current??=crypto.randomUUID();
  try{const result=await storeRequest<components['schemas']['CommerceAttempt']>(['attempts',attemptId,'mock-confirm'],{body:{outcome},key:key.current});if(result.paymentState==='paid'){onResult();return;}setError(text("ui.191ec4c066646787"));}
  catch(error){setError(storeErrorMessage(error,text));}
  setBusy(false);onBusyChange(false);
 }
 return <div className={styles.payment}><p><strong>{text("commerce.mockPayment")}</strong></p><p className={styles.secondary}>{text("ui.d5ccdbc9150f73f6")}</p>{error&&<p role="alert" className={styles.error}>{error}</p>}{busy&&<LoadingIndicator compact/>}<Button type="button" variant="contained" disabled={busy} onClick={()=>void confirm('paid')}>{text("ui.8c9ecb2f7ed3ae90")}</Button><Button type="button" disabled={busy} onClick={()=>void confirm('declined')}>{text("ui.9a48a6140d285775")}</Button></div>;
}
