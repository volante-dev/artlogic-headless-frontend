'use client';
import {useRef,useState} from 'react';
import {Button} from '@mui/material';
import type {components} from '../../lib/commerce/contract-types.generated';
import {storeRequest,storeErrorMessage} from '../../lib/commerce/client';
import {LoadingIndicator} from '../SiteLoading';
import styles from './Checkout.module.css';
export function MockPayment({attemptId,locale,onResult,onBusyChange}:{attemptId:string;locale:string;onResult:()=>void;onBusyChange:(busy:boolean)=>void}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),key=useRef<string|null>(null),fr=locale==='fr';
 async function confirm(outcome:'paid'|'declined'){
  if(busy)return;setBusy(true);onBusyChange(true);setError('');key.current??=crypto.randomUUID();
  try{const result=await storeRequest<components['schemas']['CommerceAttempt']>(['attempts',attemptId,'mock-confirm'],{body:{outcome},key:key.current});if(result.paymentState==='paid'){onResult();return;}setError(fr?'Paiement refusé dans la simulation. Vous pouvez réessayer sur cette même tentative.':'The simulated payment was declined. You can retry the same attempt.');}
  catch(error){setError(storeErrorMessage(error,locale));}
  setBusy(false);onBusyChange(false);
 }
 return <div className={styles.payment}><p><strong>{fr?'Paiement simulé':'Simulated payment'}</strong></p><p className={styles.secondary}>{fr?'Recette locale uniquement. Aucun moyen de paiement ni débit réel.':'Local testing only. No payment method or real charge.'}</p>{error&&<p role="alert" className={styles.error}>{error}</p>}{busy&&<LoadingIndicator compact/>}<Button type="button" variant="contained" disabled={busy} onClick={()=>void confirm('paid')}>{fr?'Simuler le paiement':'Simulate payment'}</Button><Button type="button" disabled={busy} onClick={()=>void confirm('declined')}>{fr?'Simuler un refus':'Simulate decline'}</Button></div>;
}
