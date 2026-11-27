import 'server-only';
import {publicFetch,PublicApiError,responseLanguagePolicyChanged} from '../api/client';
import {languageBusinessHeaders} from '../i18n/request-language';
import {validCommerceContract} from './contracts';
import type {components} from './contract-types.generated';
import {cacheLife} from 'next/cache';
export type StoreCapabilities=components['schemas']['CommerceCapabilities'];
export type StoreProduct=components['schemas']['CommerceProductPublic'];
export async function storePublicRequest<T>(path:string,schema:string,languageHeaders?:Record<string,string>):Promise<T>{
 if(!/^\/v1\/public\/store(?:\/products(?:\/[0-9a-f-]{36})?|\/checkout-options|\/documents\/(?:legal|terms|privacy|withdrawal)|\/consent-policy)?(?:\?|$)/.test(path))throw new Error('invalid_commerce_path');
 const response=await publicFetch(path,undefined,languageHeaders?{languageHeaders}:undefined);if(!response.ok){const changed=await responseLanguagePolicyChanged(response);await response.body?.cancel();throw new PublicApiError(changed?409:response.status===404?404:503,changed?'language_policy_changed':response.status===404?'not_found':'service_unavailable');}
 const reader=response.body?.getReader();if(!reader)throw new PublicApiError(503,'invalid_response');
 try{let size=0;const chunks:Uint8Array[]=[];for(;;){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>2_000_000)throw new Error('limit');chunks.push(r.value);}const value=JSON.parse(Buffer.concat(chunks).toString());if(!validCommerceContract(schema,value))throw new Error('invalid_schema');return value as T;}finally{await reader.cancel().catch(()=>{});}
}
async function cachedStoreRequest<T>(path:string,schema:string,languageHeaders:Record<string,string>):Promise<T>{'use cache';cacheLife({stale:0,revalidate:30,expire:60});return storePublicRequest<T>(path,schema,languageHeaders);}
export async function loadStoreCapabilities(locale:string){return cachedStoreRequest<StoreCapabilities>('/v1/public/store?'+new URLSearchParams({locale}),'CommerceCapabilities',await languageBusinessHeaders());}
export async function loadStoreCatalog(locale:string,cursor?:string){return cachedStoreRequest<components['schemas']['CommerceProductPublicPage']>('/v1/public/store/products?'+new URLSearchParams({locale,...(cursor?{cursor}:{})}),'CommerceProductPublicPage',await languageBusinessHeaders());}
export async function loadStoreCheckoutOptions(){return cachedStoreRequest<components['schemas']['CommerceCheckoutOptions']>('/v1/public/store/checkout-options','CommerceCheckoutOptions',await languageBusinessHeaders());}
