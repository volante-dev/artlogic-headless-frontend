'use client';
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
import {useEffect,useState} from 'react';
import {loadStripe} from '@stripe/stripe-js/pure';
import {stripePaymentLocale} from '../../lib/commerce/stripe-locale';
import type {Stripe} from '@stripe/stripe-js';
import {CheckoutElementsProvider,PaymentElement,useCheckoutElements} from '@stripe/react-stripe-js/checkout';
import {Button} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {LoadingIndicator} from '../SiteLoading';
import {useSiteContent} from '../SiteContentProvider';
import type {components} from '../../lib/commerce/contract-types.generated';
import {checkoutPaymentMatches,stripeContact} from '../../lib/commerce/payment';
import styles from './Checkout.module.css';
type S=components['schemas'];
export interface StripePaymentProps {payment:S['CommercePayment'];quote:S['CommerceQuote'];email:string;locale:string;onResult:()=>void;onBusyChange:(busy:boolean)=>void}
export function StripePayment(props:StripePaymentProps){
 const text=useRuntimeText();
 const theme=useTheme();
 const [stripe,setStripe]=useState<Stripe|null>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{let alive=true;void loadStripe(props.payment.publishableKey,{locale:stripePaymentLocale(props.locale).locale}).then(value=>{if(alive){setStripe(value);if(!value)setFailed(true);}}).catch(()=>{if(alive)setFailed(true);});return()=>{alive=false;};},[props.payment.publishableKey,props.locale]);
 if(failed)return <p role="alert">{text("ui.58d416583a41e3db")}</p>;
 if(!stripe)return <div role="status"><LoadingIndicator compact/> {text("ui.16f56784817559ba")}</div>;
 return <>{stripePaymentLocale(props.locale).fallback&&<p role="status">{text("store.payment.languageFallback")}</p>}<CheckoutElementsProvider stripe={stripe} options={{clientSecret:props.payment.clientSecret,adaptivePricing:{allowed:false},elementsOptions:{appearance:{theme:'flat',variables:{borderRadius:'0px',fontFamily:theme.typography.fontFamily,colorPrimary:theme.palette.primary.main,colorText:theme.palette.text.primary,colorBackground:theme.palette.background.paper,colorDanger:theme.palette.error.main},rules:{'.Input':{border:'1px solid '+theme.palette.divider,boxShadow:'none'},'.Input:focus':{border:'1px solid '+theme.palette.text.primary,boxShadow:'none'},'.Label':{fontSize:'14px',color:theme.palette.text.secondary}}},savedPaymentMethod:{enableSave:'never',enableRedisplay:'never'}},defaultValues:{email:props.email,billingAddress:stripeContact(props.quote.billingAddress),shippingAddress:stripeContact(props.quote.shippingAddress),...(props.quote.shippingAddress.phone?{phoneNumber:props.quote.shippingAddress.phone}:{})}}}><Payment {...props}/></CheckoutElementsProvider></>;
}
function Payment({quote,email,locale,onResult,onBusyChange}:StripePaymentProps){
 const text=useRuntimeText(locale);
 const result=useCheckoutElements(),{messages}=useSiteContent(),[busy,setBusy]=useState(false),[error,setError]=useState(''),[uncertain,setUncertain]=useState(false);
 if(result.type==='loading')return <LoadingIndicator compact/>;
 if(result.type==='error')return <p role="alert">{text("ui.865f3d943098d939")}</p>;
 const {checkout}=result,matches=checkoutPaymentMatches(checkout,quote.amounts.totalGross);
 async function pay(){
  if(busy||uncertain)return;const current=checkout;
  if(!checkoutPaymentMatches(current,quote.amounts.totalGross)){setError(text("ui.f90e4743057c4c54"));return;}
  setBusy(true);onBusyChange(true);setError('');
  try{
   const confirmed=await checkout.confirm({redirect:'if_required',email,billingAddress:stripeContact(quote.billingAddress),shippingAddress:stripeContact(quote.shippingAddress),...(quote.shippingAddress.phone?{phoneNumber:quote.shippingAddress.phone}:{})});
   if(confirmed.type==='success'){onResult();return;}
   setError(confirmed.error.message);setBusy(false);onBusyChange(false);
  }catch{setUncertain(true);setError(text("ui.fa9687158243f1fc"));setBusy(false);onBusyChange(false);}
 }
 return <div className={styles.payment}>
  <PaymentElement options={{layout:'tabs',fields:{billingDetails:{name:'never',email:'never',address:'never',phone:quote.shippingAddress.phone?'never':'auto'}},wallets:{applePay:'never',googlePay:'never',link:'never'}}}/>
  <p>{text("ui.cb95925078aadd18")} : <strong>{checkout.total.total.amount}</strong></p>
  {!matches&&<p className={styles.error} role="alert">{text("ui.9b2a0034666fef8f")}</p>}
  {error&&<p className={styles.error} role="alert">{error}</p>}
  {busy&&<LoadingIndicator compact/>}
  <Button type="button" variant="contained" disabled={busy||uncertain||!matches||!checkout.canConfirm} onClick={()=>void pay()}>{messages['commerce.pay']} {checkout.total.total.amount}</Button>
  {uncertain&&<Button type="button" onClick={onResult}>{text("ui.742a7fc5f1048d00")}</Button>}
 </div>;
}
