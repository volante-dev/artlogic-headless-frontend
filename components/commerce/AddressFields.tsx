'use client';
import type {RuntimeMessageId} from "@/lib/i18n/site-messages";
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
import {Controller,useFormContext,useWatch} from 'react-hook-form';
import {MenuItem} from '@mui/material';
import {FormTextControl} from '../forms/FormField';
import type {CheckoutValues} from '../../lib/commerce/checkout-resolver';
import type {components} from '../../lib/commerce/contract-types.generated';
import {commerceRules} from '../../lib/commerce/rules.generated';
import styles from './Checkout.module.css';
export function AddressFields({prefix,options,locale,pending=false,onCountryChange}:{prefix:'shippingAddress'|'billingAddress';options:components['schemas']['CommerceCheckoutOptions'];locale:string;pending?:boolean;onCountryChange?:(country:string)=>void}){
 const text=useRuntimeText();
 const {control}=useFormContext<CheckoutValues>(),country=useWatch({control,name:`${prefix}.country`}),rule=options.addressRules[country],shipping=prefix==='shippingAddress',auto=shipping?'shipping':'billing';
 const names=new Intl.DisplayNames([locale],{type:'region'}),countries=shipping?options.destinations:Object.keys(options.addressRules),phoneRequired=shipping&&options.phoneRequiredCountries.includes(country);
 const fields:readonly {key:Exclude<keyof components['schemas']['CommerceAddress'],'country'>;messageId:RuntimeMessageId;auto:string;required:boolean;max:number}[]=[{key:'fullName',messageId:"ui.94d68eab7ce56abb" as const,auto:'name',required:true,max:commerceRules.addressLimits.fullName},{key:'line1',messageId:"ui.4390f24857cb7a47" as const,auto:'address-line1',required:true,max:commerceRules.addressLimits.line1},{key:'line2',messageId:"ui.f9961e0c7f81daff" as const,auto:'address-line2',required:false,max:commerceRules.addressLimits.line2},{key:'locality',messageId:"ui.b403a8b5d40d46da" as const,auto:'address-level2',required:true,max:commerceRules.addressLimits.locality},...(rule?.regionRequired?[{key:'region' as const,messageId:"ui.12db022acd85e86e" as const,auto:'address-level1',required:true,max:commerceRules.addressLimits.region}]:[]),{key:'postalCode',messageId:"ui.1a8eca1338599d8f" as const,auto:'postal-code',required:rule?.postalCodeRequired??false,max:commerceRules.addressLimits.postalCode},...(phoneRequired?[{key:'phone' as const,messageId:"ui.1cd33ed6b22b2081" as const,auto:'tel',required:true,max:40}]:[])] as const;
 return <div className={styles.addressFields}>
  <Controller control={control} name={`${prefix}.country`} render={({field,fieldState})=><FormTextControl {...field} ref={undefined} onChange={e=>{field.onChange(e);onCountryChange?.(e.target.value);}} label={text("ui.1ddde940eed2c9fe")} select autoComplete={auto+' country'} required error={!!fieldState.error} helperText={fieldState.error?.message} disabled={pending} inputRef={field.ref}><MenuItem value="">{text("ui.950825b14c8f2b27")}</MenuItem>{countries.map(code=><MenuItem key={code} value={code}>{names.of(code)??code}</MenuItem>)}</FormTextControl>}/>
  {fields.map(item=><Controller key={item.key} control={control} name={`${prefix}.${item.key}`} render={({field,fieldState})=><FormTextControl {...field} ref={undefined} value={field.value??''} inputRef={field.ref} className={['fullName','line1','line2','phone'].includes(item.key)?styles.addressWide:undefined} label={text(item.messageId)} autoComplete={auto+' '+item.auto} type={item.key==='phone'?'tel':'text'} required={item.required} error={!!fieldState.error} helperText={fieldState.error?.message} disabled={pending} slotProps={{htmlInput:{maxLength:item.max,style:{boxSizing:'content-box'}}}}/>}/>)}
 </div>;
}
