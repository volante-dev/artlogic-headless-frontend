'use client';
import {useEffect,useState} from 'react';
import {loadStripe} from '@stripe/stripe-js/pure';
import type {Stripe} from '@stripe/stripe-js';
import {CheckoutElementsProvider,PaymentElement,useCheckoutElements} from '@stripe/react-stripe-js/checkout';
import {Button} from '@mui/material';
import {LoadingIndicator} from '../SiteLoading';
import {useSiteContent} from '../SiteContentProvider';
import type {components} from '../../lib/commerce/contract-types.generated';
import {checkoutPaymentMatches,stripeContact} from '../../lib/commerce/payment';
import styles from './Checkout.module.css';
type S=components['schemas'];
export interface StripePaymentProps {payment:S['CommercePayment'];quote:S['CommerceQuote'];email:string;locale:string;onResult:()=>void;onBusyChange:(busy:boolean)=>void}
export function StripePayment(props:StripePaymentProps){
 const [stripe,setStripe]=useState<Stripe|null>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{let alive=true;void loadStripe(props.payment.publishableKey,{locale:props.locale==='fr'?'fr':'en'}).then(value=>{if(alive){setStripe(value);if(!value)setFailed(true);}}).catch(()=>{if(alive)setFailed(true);});return()=>{alive=false;};},[props.payment.publishableKey,props.locale]);
 if(failed)return <p role="alert">{props.locale==='fr'?'Le paiement ne peut pas être chargé. Votre panier est conservé.':'Payment could not be loaded. Your bag is preserved.'}</p>;
 if(!stripe)return <div role="status"><LoadingIndicator compact/> {props.locale==='fr'?'Préparation du paiement':'Preparing payment'}</div>;
 return <CheckoutElementsProvider stripe={stripe} options={{clientSecret:props.payment.clientSecret,adaptivePricing:{allowed:false},elementsOptions:{appearance:{theme:'flat',variables:{borderRadius:'0px',fontFamily:'system-ui, sans-serif'}},savedPaymentMethod:{enableSave:'never',enableRedisplay:'never'}},defaultValues:{email:props.email,billingAddress:stripeContact(props.quote.billingAddress),shippingAddress:stripeContact(props.quote.shippingAddress),...(props.quote.shippingAddress.phone?{phoneNumber:props.quote.shippingAddress.phone}:{})}}}><Payment {...props}/></CheckoutElementsProvider>;
}
function Payment({quote,email,locale,onResult,onBusyChange}:StripePaymentProps){
 const result=useCheckoutElements(),{messages}=useSiteContent(),[busy,setBusy]=useState(false),[error,setError]=useState(''),[uncertain,setUncertain]=useState(false),fr=locale==='fr';
 if(result.type==='loading')return <LoadingIndicator compact/>;
 if(result.type==='error')return <p role="alert">{fr?'Le paiement est indisponible. Votre commande n’a pas été confirmée.':'Payment is unavailable. Your order has not been confirmed.'}</p>;
 const {checkout}=result,matches=checkoutPaymentMatches(checkout,quote.amounts.totalGross);
 async function pay(){
  if(busy||uncertain)return;const current=checkout;
  if(!checkoutPaymentMatches(current,quote.amounts.totalGross)){setError(fr?'Le montant du paiement diffère du récapitulatif. Revenez à la vérification.':'The payment amount differs from the summary. Return to review.');return;}
  setBusy(true);onBusyChange(true);setError('');
  try{
   const confirmed=await checkout.confirm({redirect:'if_required',email,billingAddress:stripeContact(quote.billingAddress),shippingAddress:stripeContact(quote.shippingAddress),...(quote.shippingAddress.phone?{phoneNumber:quote.shippingAddress.phone}:{})});
   if(confirmed.type==='success'){onResult();return;}
   setError(confirmed.error.message);setBusy(false);onBusyChange(false);
  }catch{setUncertain(true);setError(fr?'Le résultat du paiement est en cours de vérification. Consultez son état avant de recommencer.':'The payment result is being checked. Check its status before trying again.');setBusy(false);onBusyChange(false);}
 }
 return <div className={styles.payment}>
  <PaymentElement options={{layout:'tabs',fields:{billingDetails:{name:'never',email:'never',address:'never',phone:quote.shippingAddress.phone?'never':'auto'}},wallets:{applePay:'never',googlePay:'never',link:'never'}}}/>
  <p>{fr?'Total à payer':'Total to pay'} : <strong>{checkout.total.total.amount}</strong></p>
  {!matches&&<p className={styles.error} role="alert">{fr?'Le montant a changé. La confirmation est bloquée.':'The amount changed. Confirmation is blocked.'}</p>}
  {error&&<p className={styles.error} role="alert">{error}</p>}
  {busy&&<LoadingIndicator compact/>}
  <Button type="button" variant="contained" disabled={busy||uncertain||!matches||!checkout.canConfirm} onClick={()=>void pay()}>{messages['commerce.pay']} {checkout.total.total.amount}</Button>
  {uncertain&&<Button type="button" onClick={onResult}>{fr?'Vérifier l’état du paiement':'Check payment status'}</Button>}
 </div>;
}
