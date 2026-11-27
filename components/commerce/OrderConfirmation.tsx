'use client';
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
import {useEffect,useState} from 'react';
import {Button} from '@mui/material';
import {useSiteContent} from '../SiteContentProvider';
import {HeaderLink} from '../header/HeaderLink';
import {LoadingIndicator} from '../SiteLoading';
import {useCart} from './CartProvider';
import {CheckoutSummary} from './CheckoutSummary';
import {CheckoutProgress,ConfirmationMark,useCheckoutMotion} from './CheckoutMotion';
import {useAttemptStatus,isCommerceAttemptPending} from '../../lib/commerce/attempt-status';
import {localizedPath} from '../../lib/i18n/routes';
import styles from './Checkout.module.css';
export function OrderConfirmation({attemptId}:{attemptId:string}){
 const text=useRuntimeText();
 const {locale,defaultLocale,messages}=useSiteContent(),cart=useCart(),{attempt,error,loading,stopped,refresh}=useAttemptStatus(attemptId,locale),[downloading,setDownloading]=useState(false),[documentError,setDocumentError]=useState('');
 const {stage:stageRef}=useCheckoutMotion(attempt?.paymentState==='paid'?1:0,!!attempt);
 const clearPurchased=cart.clearPurchased,ready=cart.ready;
 useEffect(()=>{if(ready&&attempt?.paymentState==='paid'&&attempt.order)clearPurchased(attempt.id,attempt.order.lines.map(l=>({productId:l.productId,quantity:l.quantity})));},[ready,attempt,clearPurchased]);
 async function download(id:string,number:string){
  if(downloading)return;setDownloading(true);setDocumentError('');
  try{const response=await fetch('/api/store/order-documents/read',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({attemptId,documentId:id}),signal:AbortSignal.timeout(15000)});if(!response.ok||response.headers.get('content-type')?.split(';')[0]!=='text/html')throw new Error();const url=URL.createObjectURL(await response.blob()),link=document.createElement('a');link.href=url;link.download=number.replace(/[^A-Za-z0-9_-]/g,'_')+'.html';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{setDocumentError(text("ui.cde56bce0d9d8a96"));}finally{setDownloading(false);}
 }
 const paid=attempt?.paymentState==='paid',pending=!!attempt&&isCommerceAttemptPending(attempt.status);
 const heading=paid?(attempt.order?.paidUnfulfillable?(text("ui.c7cf7c4fb61979e7")):(text("ui.e90a336a092b5b9f"))):attempt?.status==='failed'?(text("ui.9af90d8e517f16bc")):attempt?.status==='expired'?(text("ui.3441aba7f56bbf53")):attempt?.nextAction==='pay'&&stopped?(text("ui.36bad9024ec9d71e")):messages['commerce.paymentPending'];
 return <div className={styles.checkout}><CheckoutProgress active={2} complete={paid&&!attempt.order?.paidUnfulfillable} locale={locale}/><section ref={stageRef} className={styles.confirmation} aria-busy={loading}><div className={paid&&attempt.order?styles.layout:undefined}><div className={styles.confirmationIntro}>
  {paid&&!attempt.order?.paidUnfulfillable&&<ConfirmationMark/>}{!paid&&(loading||pending&&!stopped)&&<div data-checkout-reveal><LoadingIndicator compact/></div>}<h2 aria-live="polite" data-checkout-reveal>{heading}</h2>
  {error&&<p role="alert" className={styles.error}>{error}</p>}
  {(pending||!attempt)&&<p data-checkout-reveal>{text("ui.074f9131b8ea6033")}</p>}
  {stopped&&!paid&&<Button type="button" className={styles.primary} disabled={loading} onClick={refresh}>{text("ui.a1fb158c86ae9558")}</Button>}
  {stopped&&attempt?.nextAction==='pay'&&<HeaderLink className={styles.textAction} href={localizedPath('/store/checkout',locale,defaultLocale)}>{text("ui.32ddfbdc384a3517")}</HeaderLink>}
  {paid&&attempt.order&&<><p className={styles.orderNumber} data-checkout-reveal>{messages['commerce.orderNumber']}<strong>{attempt.order.orderNumber}</strong></p>{attempt.order.paidUnfulfillable&&<p role="status">{text("ui.d6216b2163e9a60e")}</p>}<div className={styles.documents} data-checkout-reveal>{attempt.order.documents.map(doc=><Button key={doc.id} type="button" disabled={downloading} onClick={()=>void download(doc.id,doc.number)}>{doc.kind==='invoice'?(text("ui.3d328213a80f4d79")):doc.kind==='credit_note'?(text("ui.309cfc810dec30c9")):(text("ui.1b9f363d73f36624"))}</Button>)}</div>{documentError&&<p role="alert">{documentError}</p>}<p className={styles.secondary} data-checkout-reveal>{text("ui.8cb83b74453a9c1e")}</p><HeaderLink className={styles.primary} href={localizedPath('/store/order-tracking',locale,defaultLocale)}>{messages['commerce.orderTracking']}</HeaderLink></>}
  <p><HeaderLink className={styles.textAction} href={localizedPath('/store',locale,defaultLocale)}>{messages['commerce.continueShopping']}</HeaderLink></p>
 </div>{paid&&attempt.order&&<CheckoutSummary quote={null} receipt={attempt.order} locale={locale}/>}</div></section></div>;
}
