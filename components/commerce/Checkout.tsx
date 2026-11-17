'use client';
import {useEffect,useRef,useState,useCallback,useId} from 'react';
import dynamic from 'next/dynamic';
import {useRouter} from 'next/navigation';
import {Controller,FormProvider,useForm,useWatch,type FieldPath} from 'react-hook-form';
import {Button,Checkbox,FormControlLabel,FormHelperText,MenuItem} from '@mui/material';
import {FormTextControl} from '../forms/FormField';
import {CheckoutArrow,CheckoutDisclosure,CheckoutProgress,useCheckoutMotion} from './CheckoutMotion';
import {LoadingIndicator} from '../SiteLoading';
import {HeaderLink} from '../header/HeaderLink';
import {useHeaderNavigation} from '../header/HeaderNavigationProvider';
import {useSiteContent} from '../SiteContentProvider';
import {useCart} from './CartProvider';
import {AddressFields} from './AddressFields';
import {useDeliveryPlan,DeliveryChoice,DeliveryDetails} from './DeliveryPlan';
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
 const [deliveryCountry,setDeliveryCountry]=useState(options.destinations[0]??''),delivery=useDeliveryPlan(cart.items,locale,deliveryCountry,cart.ready&&cart.checkoutReady),[reviewDelivery,setReviewDelivery]=useState<S['CommerceDeliveryPlan']|null>(null),customerShipping=useRef<S['CommerceAddress']>({...emptyAddress}),pickupMode=delivery.plan?.mode==='pickup',appliedPickup=useRef(false);
 const validationOptions=delivery.plan?.groups.some(g=>g.phoneRequired)?{...options,phoneRequiredCountries:[...options.phoneRequiredCountries,deliveryCountry]}:options;
 const methods=useForm<CheckoutValues>({defaultValues:{email:'',shippingAddress:{...emptyAddress},billingSameAsShipping:true,billingAddress:{...emptyAddress},acceptTerms:false},resolver:checkoutResolver(validationOptions,locale,step===0?1:step===1?2:3),shouldUnregister:false}),{reset}=methods;
 const billingId=useId(),motion=useCheckoutMotion(step,sessionReady),acceptTerms=useWatch({control:methods.control,name:'acceptTerms'});
 const sameBilling=useWatch({control:methods.control,name:'billingSameAsShipping'}),email=useWatch({control:methods.control,name:'email'});
 useEffect(()=>{if(delivery.status!=='ready'||attempt)return;if(pickupMode&&!appliedPickup.current&&delivery.plan?.pickupAddress){customerShipping.current=methods.getValues('shippingAddress');methods.setValue('shippingAddress',delivery.plan.pickupAddress);methods.setValue('billingSameAsShipping',false);appliedPickup.current=true;}else if(!pickupMode&&appliedPickup.current){methods.setValue('shippingAddress',customerShipping.current);setDeliveryCountry(customerShipping.current.country||options.destinations[0]||'');appliedPickup.current=false;}},[delivery.status,delivery.plan,pickupMode,attempt,methods,options.destinations]);

 const confirmation=useCallback((id:string)=>{const href=localizedPath('/store/confirmation',locale,defaultLocale)+'?'+new URLSearchParams({attempt:id});navigation?.begin(href);router.push(href);},[locale,defaultLocale,navigation,router]);
 useEffect(()=>{
  if(!cart.ready||!cart.checkoutReady||cart.count===0)return;
  let alive=true;sessionPromise.current??=storeRequest<Guest>(['guest-sessions'],{body:{locale,purpose:'checkout'}});
  void sessionPromise.current.then(async guest=>{
   if(!alive)return;
   if(guest.activeAttemptId){
    const current=await storeRequest<S['CommerceAttempt']>(['attempts',guest.activeAttemptId],{method:'GET'});if(!alive)return;
    if(current.nextAction==='pay'&&current.checkout){const restored=current.checkout;reset({email:restored.email,shippingAddress:restored.quote.shippingAddress,billingAddress:restored.quote.billingAddress,billingSameAsShipping:JSON.stringify(restored.quote.shippingAddress)===JSON.stringify(restored.quote.billingAddress),acceptTerms:true});setQuote(restored.quote);setAttempt(current);setStep(3);}else {confirmation(current.id);return;}
   }
   setSessionReady(true);
  }).catch(e=>{if(alive){setError(storeErrorMessage(e,locale));setSessionReady(false);}});
  return()=>{alive=false;};
 },[cart.ready,cart.checkoutReady,cart.count,locale,reset,confirmation,cycle]);
 const setPaymentLocked=cart.setPaymentLocked;
 useEffect(()=>{setPaymentLocked(Boolean(attempt)||uncertainStart||busy||!!quote);return()=>setPaymentLocked(false);},[attempt,uncertainStart,busy,quote,setPaymentLocked]);
 function showError(e:unknown){
  setError(storeErrorMessage(e,locale));
  if(e instanceof StoreRequestError)for(const issue of e.issues){
   if(/^(?:email|(?:shippingAddress|billingAddress)\.(?:fullName|line1|line2|locality|region|postalCode|country|phone))$/.test(issue.path))methods.setError(issue.path as FieldPath<CheckoutValues>,{type:issue.code,message:fr?'Vérifiez ce champ.':'Check this field.'},{shouldFocus:true});
  }
 }
 async function prepareQuote(){
  if(lock.current)return;lock.current=true;setBusy(true);setError('');
  try{if(delivery.status==='loading'||delivery.status==='error')throw new Error('delivery_unavailable');const phoneCountries=delivery.plan?.groups.some(g=>g.phoneRequired)?[...options.phoneRequiredCountries,deliveryCountry]:options.phoneRequiredCountries,checkout=checkoutQuoteInput(methods.getValues(),[...cart.items],locale,phoneCountries);
   if(delivery.status==='ready'){const result=await storeRequest<S['CommerceDeliveryQuote']>(['delivery-quotes'],{body:{checkout,delivery:{...delivery.input,mode:delivery.plan!.mode,country:checkout.shippingAddress.country}}});setQuote(result.quote);setReviewDelivery(result.delivery);}else{setQuote(await storeRequest<S['CommerceQuote']>(['quotes'],{body:checkout}));setReviewDelivery(null);}intent.current=null;methods.setValue('acceptTerms',false);go(2);}
  catch(e){showError(e);}finally{lock.current=false;setBusy(false);}
 }
 function go(next:number){if(next===step)return;motion.navigate(()=>{setStep(next);if(next<2){setQuote(null);setReviewDelivery(null);methods.setValue('acceptTerms',false);}},next>step?1:-1);}
 async function next(){
  const names:FieldPath<CheckoutValues>[]=step===0?['email','shippingAddress']:['billingSameAsShipping','billingAddress'];
  if(delivery.status==='loading'||delivery.status==='error'||cart.pending)return;
  if(!await methods.trigger(step===1?undefined:names,{shouldFocus:true})){if(step===1&&(methods.getFieldState('shippingAddress').invalid||methods.getFieldState('email').invalid)){setError(fr?'Complétez vos coordonnées pour ce mode de livraison.':'Complete your details for this delivery method.');go(0);}return;}
  if(step===1)await prepareQuote();else go(1);
 }
 async function startPayment(){
  if(lock.current||!quote||cart.pending)return;lock.current=true;setBusy(true);setError('');intent.current??=crypto.randomUUID();
  try{
   const result=await storeRequest<S['CommerceAttempt']>(['attempts'],{key:intent.current,body:{quoteId:quote.id,quoteFingerprint:quote.fingerprint,acceptedTerms:{version:quote.termsVersion,hash:quote.termsHash,accepted:true}}});setUncertainStart(false);
   if(result.nextAction==='pay'&&result.payment){setAttempt(result);setQuote(result.checkout?.quote??quote);setStep(3);}else confirmation(result.id);
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
 const pending=busy||paymentBusy||motion.moving,deliveryOptions=validationOptions,deliveryBusy=delivery.status==='loading'||delivery.status==='error',labels=fr?['Vos coordonnées','Votre livraison','Votre paiement']:['Your details','Your delivery','Your payment'],active=Math.min(step,2);
 const edit=(target:number)=>{if(attempt)void editPayment();else go(target);};
 return <FormProvider {...methods}><div className={styles.checkout}><CheckoutProgress active={active} locale={locale} disabled={pending||uncertainStart} onChange={edit}/><div className={styles.layout}><div ref={motion.stage} className={styles.stage}><form className={styles.form} noValidate onSubmit={event=>{event.preventDefault();if(step<2)void next();else if(step===2)void methods.handleSubmit(startPayment)(event);}} aria-busy={pending}>
  <div className={styles.heading} data-checkout-reveal><h2 tabIndex={-1}>{labels[active]}</h2><p>{step===0?(fr?'Commandez simplement, sans créer de compte.':'Order simply, without creating an account.'):step===1?(fr?'Choisissez comment recevoir votre sélection.':'Choose how to receive your selection.'):(fr?'Dernière étape avant de confirmer votre commande.':'One last step before confirming your order.')}</p></div>
  {error&&<div role="alert" className={styles.error}>{error}</div>}
  {!sessionReady&&<>{!error&&<p role="status"><LoadingIndicator compact/> {fr?'Préparation de votre session':'Preparing your session'}</p>}{error&&<Button type="button" onClick={()=>{sessionPromise.current=null;setError('');setCycle(c=>c+1);}}>{messages['commerce.retry']}</Button>}</>}
  {sessionReady&&<>
   {step===0&&<><div data-checkout-reveal><Controller control={methods.control} name="email" render={({field,fieldState})=><FormTextControl {...field} ref={undefined} inputRef={field.ref} label={messages['commerce.email']} type="email" autoComplete="email" required disabled={pending} error={!!fieldState.error} helperText={fieldState.error?.message??(fr?'Pour confirmer et suivre votre commande.':'For order confirmation and tracking.')} slotProps={{htmlInput:{maxLength:254,style:{boxSizing:'content-box'}}}}/>}/></div><div data-checkout-reveal><DeliveryChoice state={delivery} locale={locale} disabled={pending} compact/></div>
    {pickupMode&&options.destinations.length>1&&<FormTextControl select label={fr?'Destination envisagée pour une expédition':'Shipping destination'} value={deliveryCountry} disabled={pending} onChange={e=>{setDeliveryCountry(e.target.value);delivery.clearSelections();}}>{options.destinations.map(c=><MenuItem key={c} value={c}>{new Intl.DisplayNames([locale],{type:'region'}).of(c)??c}</MenuItem>)}</FormTextControl>}
    {!pickupMode&&<div data-checkout-reveal><AddressFields prefix="shippingAddress" options={deliveryOptions} locale={locale} pending={pending} onCountryChange={c=>{setDeliveryCountry(c);delivery.clearSelections();}}/></div>}
   </>}
   {step===1&&<><div data-checkout-reveal><DeliveryChoice state={delivery} locale={locale} disabled={pending}/></div><section className={styles.billing} data-checkout-reveal><h3>{messages['commerce.billingAddress']}</h3>{!pickupMode&&<Controller control={methods.control} name="billingSameAsShipping" render={({field})=><FormControlLabel label={messages['commerce.sameBilling']} control={<Checkbox checked={field.value} onChange={e=>field.onChange(e.target.checked)} disabled={pending} slotProps={{input:{'aria-controls':billingId,'aria-expanded':!field.value}}}/>}/>}/>} {pickupMode&&<p className={styles.secondary}>{fr?'Pour votre retrait, renseignez votre adresse de facturation.':'Enter your billing address for gallery collection.'}</p>}<CheckoutDisclosure id={billingId} open={!sameBilling||pickupMode}><AddressFields prefix="billingAddress" options={options} locale={locale} pending={pending||sameBilling&&!pickupMode}/></CheckoutDisclosure></section></>}
   {step>=2&&quote&&<><div className={styles.readbacks} data-checkout-reveal><div><span>{fr?'Contact':'Contact'}</span><p>{methods.getValues('email')}</p><button type="button" disabled={pending||uncertainStart} onClick={()=>edit(0)}>{fr?'Modifier':'Edit'}<span className={styles.srOnly}>{fr?' les coordonnées':' contact details'}</span></button></div><div><span>{reviewDelivery?.mode==='pickup'?(fr?'Retrait':'Collection'):(fr?'Livraison':'Delivery')}</span><div><Address address={quote.shippingAddress} locale={locale}/><small className={styles.secondary}>{quote.shippingOption.label} · {quote.shippingOption.deliveryEstimate}</small></div><button type="button" disabled={pending||uncertainStart} onClick={()=>edit(1)}>{fr?'Modifier':'Edit'}<span className={styles.srOnly}>{fr?' la livraison':' delivery'}</span></button></div><div><span>{fr?'Facturation':'Billing'}</span><Address address={quote.billingAddress} locale={locale}/><button type="button" disabled={pending||uncertainStart} onClick={()=>edit(1)}>{fr?'Modifier':'Edit'}<span className={styles.srOnly}>{fr?' la facturation':' billing'}</span></button></div></div>
    {reviewDelivery?.separateShipments&&<div className={styles.reviewDelivery} data-checkout-reveal><DeliveryDetails plan={reviewDelivery} locale={locale} compact/></div>}
    <div className={styles.terms} data-checkout-reveal><Controller control={methods.control} name="acceptTerms" render={({field,fieldState})=><div><FormControlLabel label={<span>{fr?'J’ai lu et j’accepte les ':'I have read and accept the '}<HeaderLink href={termsHref+'?'+new URLSearchParams({version:quote.termsVersion})} target="_blank" rel="noopener noreferrer">{messages['commerce.terms']}</HeaderLink></span>} control={<Checkbox checked={field.value} onChange={e=>field.onChange(e.target.checked)} disabled={pending||uncertainStart||!!attempt} required slotProps={{input:{ref:field.ref,'aria-describedby':fieldState.error?'checkout-terms-error':undefined}}}/>}/>{fieldState.error&&<FormHelperText id="checkout-terms-error" error>{fieldState.error.message}</FormHelperText>}</div>}/></div>
   </>}
   {step<2&&<div className={styles.formActions} data-checkout-reveal>{step===0?<HeaderLink className={styles.textAction} href={localizedPath('/store',locale,defaultLocale)}>{fr?'Retour au Store':'Back to Store'}</HeaderLink>:<button type="button" className={styles.textAction} disabled={pending} onClick={()=>go(0)}>{fr?'Retour aux coordonnées':'Back to your details'}</button>}<Button className={styles.primary} type="submit" variant="contained" disabled={pending||deliveryBusy||cart.pending}><span>{step===0?(fr?'Continuer vers la livraison':'Continue to delivery'):(fr?'Continuer vers le paiement':'Continue to payment')}</span><CheckoutArrow/></Button></div>}
   {step===2&&<><Button className={styles.primary} type="submit" variant="contained" disabled={pending||cart.pending||!acceptTerms} data-checkout-reveal><span>{uncertainStart?(fr?'Vérifier l’état du paiement':'Check payment status'):(fr?'Afficher le paiement sécurisé':'Show secure payment')}</span><CheckoutArrow/></Button><p className={styles.secondary}>{fr?'Acceptez les conditions pour accéder au paiement. Aucun débit n’a lieu à cette étape.':'Accept the terms to access payment. No charge is made at this stage.'}</p><button type="button" className={styles.textAction} disabled={pending||uncertainStart} onClick={()=>go(1)}>{fr?'Retour à la livraison':'Back to delivery'}</button></>}
   {step===3&&attempt?.payment&&quote&&<div data-checkout-reveal>{attempt.payment.mode==='stripe'?<StripePayment payment={attempt.payment} quote={quote} email={email} locale={locale} onResult={()=>confirmation(attempt.id)} onBusyChange={setPaymentBusy}/>:<MockPayment attemptId={attempt.id} locale={locale} onResult={()=>confirmation(attempt.id)} onBusyChange={setPaymentBusy}/>}<button className={styles.textAction} type="button" disabled={pending} onClick={()=>void editPayment()}>{fr?'Modifier la commande':'Edit order'}</button></div>}
  </>}
  {busy&&<LoadingIndicator compact label={messages['commerce.checking']}/>}
 </form></div><CheckoutSummary quote={quote} locale={locale} delivery={reviewDelivery??(delivery.status==='ready'?delivery.plan:null)}/></div></div></FormProvider>;
}
function Address({address:a,locale}:{address:S['CommerceAddress'];locale:string}){return <address>{a.fullName}<br/>{a.line1}{a.line2&&<><br/>{a.line2}</>}<br/>{[a.postalCode,a.locality].filter(Boolean).join(' ')}{a.region&&<><br/>{a.region}</>}<br/>{new Intl.DisplayNames([locale],{type:'region'}).of(a.country)??a.country}</address>;}
