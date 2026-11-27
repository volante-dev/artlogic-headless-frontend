import {runtimeText} from "../i18n/site-messages";
import type {Resolver,FieldErrors} from 'react-hook-form';
import type {components} from './contract-types.generated';
import {validateAddress,normalizeCommerceEmail} from './address.generated';
import {DomainError} from './rule-error.generated';
type S=components['schemas'];
export interface CheckoutValues {email:string;shippingAddress:S['CommerceAddress'];billingSameAsShipping:boolean;billingAddress:S['CommerceAddress'];acceptTerms:boolean}
export function checkoutResolver(options:S['CommerceCheckoutOptions'],locale:string,step:number,messages:Readonly<Record<string,string|undefined>>):Resolver<CheckoutValues>{
 return async values=>{
  const issues:{path:string;code:string}[]=[],errors:FieldErrors<CheckoutValues>={};
  const capture=(work:()=>void,fallback:string)=>{try{work();}catch(e){if(e instanceof DomainError&&e.context.issues)issues.push(...e.context.issues);else issues.push({path:fallback,code:'invalid'});}};
  capture(()=>{normalizeCommerceEmail(values.email);},'email');
  if(step>=1){
   if(!options.destinations.includes(values.shippingAddress.country))issues.push({path:'shippingAddress.country',code:'required'});
   else capture(()=>{validateAddress(values.shippingAddress,options.addressRules,{path:'shippingAddress',phoneRequired:options.phoneRequiredCountries.includes(values.shippingAddress.country)});},'shippingAddress.country');
  }
  if(step>=2&&!values.billingSameAsShipping)capture(()=>{validateAddress(values.billingAddress,options.addressRules,{path:'billingAddress'});},'billingAddress.country');
  if(step>=3&&!values.acceptTerms)issues.push({path:'acceptTerms',code:'required'});
  for(const issue of issues){
   const path=issue.path.split('.');let target=errors as Record<string,unknown>;
   for(const part of path.slice(0,-1)){target[part]??={};target=target[part] as Record<string,unknown>;}
   target[path.at(-1)!]={type:issue.code,message:runtimeText(messages,locale,issue.code==='required'?'store.validation.required':'store.validation.invalid')};
  }
  return issues.length?{values:{},errors}:{values,errors:{}};
 };
}
/** Hidden billing values never leave the browser when the identical-address option is selected. */
export function checkoutQuoteInput(values:CheckoutValues,items:S['CommerceCartLineInput'][],locale:string,phoneRequiredCountries:readonly string[]=[]):S['CommerceQuoteInput']{
 const {phone,...shipping}=values.shippingAddress,billing={...values.billingAddress};delete billing.phone;
 return {items,locale,email:normalizeCommerceEmail(values.email),shippingAddress:{...shipping,...(phone&&phoneRequiredCountries.includes(shipping.country)?{phone}:{})},billingSameAsShipping:values.billingSameAsShipping,...(!values.billingSameAsShipping?{billingAddress:billing}:{})};
}
