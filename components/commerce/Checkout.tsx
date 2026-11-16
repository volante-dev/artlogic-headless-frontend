'use client';
import {useEffect,useRef,useState,useCallback} from 'react';
import dynamic from 'next/dynamic';
import {useRouter} from 'next/navigation';
import {Controller,FormProvider,useForm,useWatch,type FieldPath} from 'react-hook-form';
import {Button,Checkbox,FormControlLabel,FormHelperText} from '@mui/material';
import {FormTextControl} from '../forms/FormField';
import {FormStepControls} from '../forms/FormSteps';
import {LoadingIndicator} from '../SiteLoading';
import {HeaderLink} from '../header/HeaderLink';
import {useHeaderNavigation} from '../header/HeaderNavigationProvider';
import {useSiteContent} from '../SiteContentProvider';
import {useCart} from './CartProvider';
import {AddressFields} from './AddressFields';
import {CheckoutSummary} from './CheckoutSummary';
import {checkoutResolver,checkoutQuoteInput,type CheckoutValues} from '../../lib/commerce/checkout-resolver';
import {storeRequest,storeErrorMessage,StoreRequestError} from '../../lib/commerce/client';
import {localizedPath} from '../../lib/i18n/routes';
import type {components} from '../../lib/commerce/contract-types.generated';
import styles from './Checkout.module.css';
const StripePayment=dynamic(()=>import('./StripePayment').then(m=>m.StripePayment),{ssr:false,loading:()=> <LoadingIndicator compact/>});
const MockPayment=dynamic(()=>import('./MockPayment').then(m=>m.MockPayment),{ssr:false,loading:()=> <LoadingIndicator compact/>});
type S=components['schemas'];
type Guest=Omit<S['CommerceGuestSession'],'capability'>;
const emptyAddress={fullName:'',line1:'',line2:'',locality:'',region:'',postalCode:'',country:''};
export function Checkout({options,termsHref}:{options:S['CommerceCheckoutOptions'];termsHref:string}){
 const cart=useCart(),{locale,defaultLocale,messages}=useSiteContent(),router=useRouter(),navigation=useHeaderNavigation(),fr=locale==='fr';
 const [step,setStep]=useState(0),[quote,setQuote]=useState<S['CommerceQuote']|null>(null),[attempt,setAttempt]=useState<S['CommerceAttempt']|null>(null),[busy,setBusy]=useState(false),[paymentBusy,setPaymentBusy]=useState(false),[error,setError]=useState(''),[sessionReady,setSessionReady]=useState(false),[cycle,setCycle]=useState(0),[uncertainStart,setUncertainStart]=useState(false);
 const sessionPromise=useRef<Promise<Guest>|null>(null),lock=useRef(false),intent=useRef<string|null>(null),cancelKey=useRef<string|null>(null);
 const methods=useForm<CheckoutValues>({defaultValues:{email:'',shippingAddress:{...emptyAddress},billingSameAsShipping:true,billingAddress:{...emptyAddress},acceptTerms:false},resolver:checkoutResolver(options,locale,Math.min(step,3)),shouldUnregister:false}),{reset}=methods;
 const sameBilling=useWatch({control:methods.control,name:'billingSameAsShipping'}),email=useWatch({control:methods.control,name:'email'});
 const confirmation=useCallback((id:string)=>{const href=localizedPath('/store/confirmation',locale,defaultLocale)+'?'+new URLSearchParams({attempt:id});navigation?.begin(href);router.push(href);},[locale,defaultLocale,navigation,router]);
 useEffect(()=>{
  if(!cart.ready||!cart.checkoutReady||cart.count===0)return;
  let alive=true;sessionPromise.current??=storeRequest<Guest>(['guest-sessions'],{body:{locale,purpose:'checkout'}});
  void sessionPromise.current.then(async guest=>{
   if(!alive)return;
   if(guest.activeAttemptId){
    const current=await storeRequest<S['CommerceAttempt']>(['attempts',guest.activeAttemptId],{method:'GET'});if(!alive)return;
    if(current.nextAction==='pay'&&current.checkout){const restored=current.checkout;reset({email:restored.email,shippingAddress:restored.quote.shippingAddress,billingAddress:restored.quote.billingAddress,billingSameAsShipping:JSON.stringify(restored.quote.shippingAddress)===JSON.stringify(restored.quote.billingAddress),acceptTerms:true});setQuote(restored.quote);setAttempt(current);setStep(4);}else {confirmation(current.id);return;}
   }
   setSessionReady(true);
  }).catch(e=>{if(alive){setError(storeErrorMessage(e,locale));setSessionReady(false);}});
  return()=>{alive=false;};
 },[cart.ready,cart.checkoutReady,cart.count,locale,reset,confirmation,cycle]);
 const setPaymentLocked=cart.setPaymentLocked;
 useEffect(()=>{setPaymentLocked(Boolean(attempt));return()=>setPaymentLocked(false);},[attempt,setPaymentLocked]);
 function showError(e:unknown){
  setError(storeErrorMessage(e,locale));
  if(e instanceof StoreRequestError)for(const issue of e.issues){
   if(/^(?:email|(?:shippingAddress|billingAddress)\.(?:fullName|line1|line2|locality|region|postalCode|country|phone))$/.test(issue.path))methods.setError(issue.path as FieldPath<CheckoutValues>,{type:issue.code,message:fr?'Vérifiez ce champ.':'Check this field.'},{shouldFocus:true});
  }
 }
 async function prepareQuote(){
  if(lock.current)return;lock.current=true;setBusy(true);setError('');
  try{const result=await storeRequest<S['CommerceQuote']>(['quotes'],{body:checkoutQuoteInput(methods.getValues(),[...cart.items],locale,options.phoneRequiredCountries)});setQuote(result);intent.current=null;methods.setValue('acceptTerms',false);setStep(3);}
  catch(e){showError(e);}finally{lock.current=false;setBusy(false);}
 }
 async function next(){
  const names:FieldPath<CheckoutValues>[]=step===0?['email']:step===1?['shippingAddress']:['billingSameAsShipping','billingAddress'];
  if(!await methods.trigger(names,{shouldFocus:true}))return;
  if(step===2)await prepareQuote();else setStep(s=>s+1);
 }
 async function startPayment(){
  if(lock.current||!quote)return;lock.current=true;setBusy(true);setError('');intent.current??=crypto.randomUUID();
  try{
   const result=await storeRequest<S['CommerceAttempt']>(['attempts'],{key:intent.current,body:{quoteId:quote.id,quoteFingerprint:quote.fingerprint,acceptedTerms:{version:quote.termsVersion,hash:quote.termsHash,accepted:true}}});setUncertainStart(false);
   if(result.nextAction==='pay'&&result.payment){setAttempt(result);setQuote(result.checkout?.quote??quote);setStep(4);}else confirmation(result.id);
  }catch(e){if(e instanceof StoreRequestError&&(e.status===0||e.status===503))setUncertainStart(true);showError(e);}
  finally{lock.current=false;setBusy(false);}
 }
 async function editPayment(){
  if(!attempt||lock.current||paymentBusy)return;lock.current=true;setBusy(true);setError('');cancelKey.current??=crypto.randomUUID();
  try{
   const result=await storeRequest<S['CommerceAttempt']>(['attempts',attempt.id,'cancel'],{body:{reason:'edit_checkout'},key:cancelKey.current});
   if(result.status==='expired'||result.status==='failed'){setAttempt(null);setQuote(null);setStep(0);methods.setValue('acceptTerms',false);intent.current=null;cancelKey.current=null;sessionPromise.current=null;}
   else confirmation(result.id);
  }catch(e){showError(e);}finally{lock.current=false;setBusy(false);}
 }
 if(!cart.ready)return <p role="status"><LoadingIndicator compact/></p>;
 if(!cart.checkoutReady)return <p>{messages['commerce.salesSuspended']}</p>;
 if(cart.count===0&&!attempt)return <section className={styles.confirmation}><h2>{messages['commerce.emptyCart']}</h2><HeaderLink href={localizedPath('/store',locale,defaultLocale)}>{messages['commerce.continueShopping']}</HeaderLink></section>;
 const pending=busy||paymentBusy;
 const labels=fr?['Contact','Livraison','Facturation','Vérification','Paiement']:['Contact','Delivery','Billing','Review','Payment'];
 return <FormProvider {...methods}><div className={styles.layout}><form className={styles.form} noValidate onSubmit={event=>{event.preventDefault();if(step<3)void next();else if(step===3)void methods.handleSubmit(startPayment)(event);}} aria-busy={pending}>
  <h2>{labels[step]}</h2>
  {error&&<div role="alert" className={styles.error}>{error}</div>}
  {!sessionReady&&<>{!error&&<p role="status"><LoadingIndicator compact/> {fr?'Préparation de votre session':'Preparing your session'}</p>}{error&&<Button type="button" onClick={()=>{sessionPromise.current=null;setError('');setCycle(c=>c+1);}}>{messages['commerce.retry']}</Button>}</>}
  {sessionReady&&<>
   {step===0&&<><p className={styles.secondary}>{fr?'Votre e-mail permet de confirmer et de suivre la commande. Aucun compte n’est nécessaire.':'Your email is used to confirm and track your order. No account is needed.'}</p><Controller control={methods.control} name="email" render={({field,fieldState})=><FormTextControl {...field} ref={undefined} inputRef={field.ref} label={messages['commerce.email']} type="email" autoComplete="email" required disabled={pending} error={!!fieldState.error} helperText={fieldState.error?.message} slotProps={{htmlInput:{maxLength:254,style:{boxSizing:'content-box'}}}}/>}/></>}
   {step===1&&<AddressFields prefix="shippingAddress" options={options} locale={locale} pending={pending}/>}
   {step===2&&<><Controller control={methods.control} name="billingSameAsShipping" render={({field})=><FormControlLabel label={messages['commerce.sameBilling']} control={<Checkbox checked={field.value} onChange={e=>field.onChange(e.target.checked)} disabled={pending}/>}/>}/>{!sameBilling&&<AddressFields prefix="billingAddress" options={options} locale={locale} pending={pending}/>}</>}
   {step===3&&quote&&<div className={styles.review}><section><h3>{messages['commerce.shippingAddress']}</h3><Address address={quote.shippingAddress}/><p>{quote.shippingOption.label} · {quote.shippingOption.deliveryEstimate}</p></section><section><h3>{messages['commerce.billingAddress']}</h3><Address address={quote.billingAddress}/></section><p><HeaderLink href={termsHref+'?'+new URLSearchParams({version:quote.termsVersion})} target="_blank" rel="noopener noreferrer">{messages['commerce.terms']} ({quote.termsVersion})</HeaderLink></p><Controller control={methods.control} name="acceptTerms" render={({field,fieldState})=><div><FormControlLabel label={messages['commerce.acceptTerms']} control={<Checkbox checked={field.value} onChange={e=>field.onChange(e.target.checked)} disabled={pending||uncertainStart} required slotProps={{input:{ref:field.ref,'aria-describedby':fieldState.error?'checkout-terms-error':undefined}}}/>}/>{fieldState.error&&<FormHelperText id="checkout-terms-error" error>{fieldState.error.message}</FormHelperText>}</div>}/></div>}
   {step<4&&<FormStepControls index={step} count={4} label={labels[step]!} pending={pending} backDisabled={uncertainStart} onBack={()=>{setQuote(null);methods.setValue('acceptTerms',false);setStep(s=>Math.max(0,s-1));}} onContinue={()=>void next()} backLabel={fr?'Précédent':'Back'} continueLabel={messages['commerce.continue']} submitLabel={uncertainStart?(fr?'Vérifier l’état du paiement':'Check payment status'):(fr?'Continuer vers le paiement':'Continue to payment')}/>}
   {step===4&&attempt?.payment&&quote&&<><p className={styles.secondary}>{fr?'Votre récapitulatif est réservé pour cette tentative.':'Your reviewed order is reserved for this payment attempt.'}</p>{attempt.payment.mode==='stripe'?<StripePayment payment={attempt.payment} quote={quote} email={email} locale={locale} onResult={()=>confirmation(attempt.id)} onBusyChange={setPaymentBusy}/>:<MockPayment attemptId={attempt.id} locale={locale} onResult={()=>confirmation(attempt.id)} onBusyChange={setPaymentBusy}/>}<Button type="button" disabled={pending} onClick={()=>void editPayment()}>{fr?'Modifier la commande':'Edit order'}</Button></>}
  </>}
  {busy&&<LoadingIndicator compact label={messages['commerce.checking']}/>}
 </form><CheckoutSummary quote={quote} locale={locale}/></div></FormProvider>;
}
function Address({address:a}:{address:S['CommerceAddress']}){return <address>{a.fullName}<br/>{a.line1}{a.line2&&<><br/>{a.line2}</>}<br/>{[a.postalCode,a.locality].filter(Boolean).join(' ')}{a.region&&<><br/>{a.region}</>}<br/>{a.country}</address>;}
