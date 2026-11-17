'use client';
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
 const {locale,defaultLocale,messages}=useSiteContent(),cart=useCart(),{attempt,error,loading,stopped,refresh}=useAttemptStatus(attemptId,locale),[downloading,setDownloading]=useState(false),[documentError,setDocumentError]=useState(''),fr=locale==='fr';
 const {stage:stageRef}=useCheckoutMotion(attempt?.paymentState==='paid'?1:0,!!attempt);
 const clearPurchased=cart.clearPurchased,ready=cart.ready;
 useEffect(()=>{if(ready&&attempt?.paymentState==='paid'&&attempt.order)clearPurchased(attempt.id,attempt.order.lines.map(l=>({productId:l.productId,quantity:l.quantity})));},[ready,attempt,clearPurchased]);
 async function download(id:string,number:string){
  if(downloading)return;setDownloading(true);setDocumentError('');
  try{const response=await fetch('/api/store/order-documents/read',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({attemptId,documentId:id}),signal:AbortSignal.timeout(15000)});if(!response.ok||response.headers.get('content-type')?.split(';')[0]!=='text/html')throw new Error();const url=URL.createObjectURL(await response.blob()),link=document.createElement('a');link.href=url;link.download=number.replace(/[^A-Za-z0-9_-]/g,'_')+'.html';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{setDocumentError(fr?'Le document n’a pas pu être téléchargé. Réessayez.':'The document could not be downloaded. Try again.');}finally{setDownloading(false);}
 }
 const paid=attempt?.paymentState==='paid',pending=!!attempt&&isCommerceAttemptPending(attempt.status);
 const heading=paid?(attempt.order?.paidUnfulfillable?(fr?'Paiement reçu, disponibilité en vérification':'Payment received, availability being checked'):(fr?'Votre commande est confirmée':'Your order is confirmed')):attempt?.status==='failed'?(fr?'Cette tentative n’a pas abouti':'This payment attempt did not complete'):attempt?.status==='expired'?(fr?'Cette tentative est clôturée':'This payment attempt is closed'):attempt?.nextAction==='pay'&&stopped?(fr?'Votre paiement reste à terminer':'Your payment still needs to be completed'):messages['commerce.paymentPending'];
 return <div className={styles.checkout}><CheckoutProgress active={2} complete={paid&&!attempt.order?.paidUnfulfillable} locale={locale}/><section ref={stageRef} className={styles.confirmation} aria-busy={loading}><div className={paid&&attempt.order?styles.layout:undefined}><div className={styles.confirmationIntro}>
  {paid&&!attempt.order?.paidUnfulfillable&&<ConfirmationMark/>}{!paid&&(loading||pending&&!stopped)&&<div data-checkout-reveal><LoadingIndicator compact/></div>}<h2 aria-live="polite" data-checkout-reveal>{heading}</h2>
  {error&&<p role="alert" className={styles.error}>{error}</p>}
  {(pending||!attempt)&&<p data-checkout-reveal>{fr?'Nous vérifions l’état enregistré de votre paiement. Ne lancez pas un nouveau paiement pendant cette vérification.':'We are checking the recorded payment status. Do not start a new payment while it is being checked.'}</p>}
  {stopped&&!paid&&<Button type="button" className={styles.primary} disabled={loading} onClick={refresh}>{fr?'Vérifier l’état':'Check status'}</Button>}
  {stopped&&attempt?.nextAction==='pay'&&<HeaderLink className={styles.textAction} href={localizedPath('/store/checkout',locale,defaultLocale)}>{fr?'Reprendre ce paiement':'Resume this payment'}</HeaderLink>}
  {paid&&attempt.order&&<><p className={styles.orderNumber} data-checkout-reveal>{messages['commerce.orderNumber']}<strong>{attempt.order.orderNumber}</strong></p>{attempt.order.paidUnfulfillable&&<p role="status">{fr?'Le vendeur va vérifier la disponibilité et vous contacter. Aucune expédition n’est encore confirmée.':'The seller will check availability and contact you. No dispatch is confirmed yet.'}</p>}<div className={styles.documents} data-checkout-reveal>{attempt.order.documents.map(doc=><Button key={doc.id} type="button" disabled={downloading} onClick={()=>void download(doc.id,doc.number)}>{doc.kind==='invoice'?(fr?'Télécharger la facture':'Download invoice'):doc.kind==='credit_note'?(fr?'Télécharger l’avoir':'Download credit note'):(fr?'Télécharger le justificatif':'Download receipt')}</Button>)}</div>{documentError&&<p role="alert">{documentError}</p>}<p className={styles.secondary} data-checkout-reveal>{fr?'Retrouvez votre commande avec son numéro et l’e-mail utilisé lors de l’achat.':'Find your order with its number and the email used at checkout.'}</p><HeaderLink className={styles.primary} href={localizedPath('/store/order-tracking',locale,defaultLocale)}>{messages['commerce.orderTracking']}</HeaderLink></>}
  <p><HeaderLink className={styles.textAction} href={localizedPath('/store',locale,defaultLocale)}>{messages['commerce.continueShopping']}</HeaderLink></p>
 </div>{paid&&attempt.order&&<CheckoutSummary quote={null} receipt={attempt.order} locale={locale}/>}</div></section></div>;
}
