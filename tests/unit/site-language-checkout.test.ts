import {StoreRequestError,storeErrorMessage} from '../../lib/commerce/client';
import {storePageMetadata} from '../../lib/commerce/metadata';
import {runtimeText,type SiteMessages} from '../../lib/i18n/site-messages';
import {describe,it,expect} from 'vitest';
import {checkoutResolver,type CheckoutValues} from '../../lib/commerce/checkout-resolver';
import {stripePaymentLocale} from '../../lib/commerce/stripe-locale';
import {initialMessages,legacyRuntimeMessages} from '../../lib/i18n/site-messages';
const options={destinations:['FR'],addressRules:{FR:{postalCodeRequired:true,regionRequired:false}},phoneRequiredCountries:[]};
const messages={...legacyRuntimeMessages(initialMessages('en'),'en'),'store.validation.required':'Campo obbligatorio.','store.validation.invalid':'Valore non valido.','store.error.out_of_stock':'Quantità non disponibile.','ui.eed4bf475334d230':'Richiesta non confermata.','store.meta.checkoutTitle':'Pagamento','store.meta.checkoutDescription':'Descrizione del pagamento.'};
describe('US2 checkout language follows the supplied catalogue',()=>{
 it('localizes validation without changing address, billing or terms requirements',async()=>{
  const values:CheckoutValues={email:'wrong',shippingAddress:{fullName:'',line1:'',locality:'',country:'FR',postalCode:''},billingSameAsShipping:false,billingAddress:{fullName:'',line1:'',locality:'',country:'FR',postalCode:''},acceptTerms:false};
  const result=await checkoutResolver(options,'it',3,messages)(values,undefined,{} as never);
  expect(result.errors.email?.message).toBe('Valore non valido.');expect(result.errors.shippingAddress?.fullName?.message).toBe('Campo obbligatorio.');expect(result.errors.billingAddress?.fullName?.message).toBe('Campo obbligatorio.');expect(result.errors.acceptTerms?.message).toBe('Campo obbligatorio.');
 });
 it('renders known and unknown request failures from supplied text without exposing raw provider messages',()=>{
  const text=(id:Parameters<typeof runtimeText>[2])=>runtimeText(messages,'it',id);
  expect(storeErrorMessage(new StoreRequestError(409,'out_of_stock'),text)).toBe('Quantità non disponibile.');expect(storeErrorMessage(new StoreRequestError(500,'__proto__'),text)).toBe('Richiesta non confermata.');expect(storeErrorMessage(new Error('PRIVATE PROVIDER DETAIL'),text)).toBe('Richiesta non confermata.');
 });
 it('uses contributed page metadata and closes an incomplete Store catalogue locally',()=>{
  expect(storePageMetadata('checkout',{messages,locale:'it',siteName:'Galerie'})).toEqual({title:'Pagamento | Galerie',description:'Descrizione del pagamento.'});const partial:SiteMessages={...messages};delete partial['store.validation.required'];expect(storePageMetadata('checkout',{messages:partial,locale:'it',siteName:'Galerie'})).toEqual({title:'Galerie'});
 });
 it('uses supported Stripe languages and explicitly reports a provider fallback',()=>{
  expect(stripePaymentLocale('it')).toEqual({locale:'it',fallback:false});expect(stripePaymentLocale('fr-ca')).toEqual({locale:'fr-CA',fallback:false});expect(stripePaymentLocale('pt-br')).toEqual({locale:'pt-BR',fallback:false});expect(stripePaymentLocale('de-at')).toEqual({locale:'de',fallback:false});expect(stripePaymentLocale('xx')).toEqual({locale:'auto',fallback:true});
 });
});
