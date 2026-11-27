import 'server-only';
import {AsyncLocalStorage} from 'node:async_hooks';
import {cache} from 'react';
import {headers} from 'next/headers';
import {loadConfig,stringValue,configuredLocalePolicy} from '../config/env';
import {readRuntimeLanguagePolicy} from './runtime-policy';
import type {RuntimePolicyRead} from './runtime-policy-transport';
import {decodeLanguageRequest,languageContextHeader,routingLanguagePolicy} from './runtime-routing';
const scope=new AsyncLocalStorage<RuntimePolicyRead>();
export function withRuntimeLanguageRequest<T>(read:RuntimePolicyRead,work:()=>T):T{return scope.run(read,work);}
const fromRequest=cache(async():Promise<RuntimePolicyRead>=>{
 const context=await headers(),config=loadConfig(),value=context.get(languageContextHeader);
 if(context.get('x-site-language-unavailable')==='1')return {kind:'unavailable',reason:'unavailable'};
 if(value){try{const decoded=decodeLanguageRequest(value,stringValue(config,'SITE_ID'));return {kind:'runtime',...decoded};}catch{return {kind:'unavailable',reason:'expired'};}}
 if(context.get('x-site-language-mode')==='legacy')return {kind:'legacy'};
 return readRuntimeLanguagePolicy();
});
/** Proxy state is explicit; render state crosses runtimes through sanitized request headers. */
export function requestLanguagePolicy():Promise<RuntimePolicyRead>{const current=scope.getStore();return current?Promise.resolve(current):fromRequest();}
export async function requestRoutingPolicy(){
 const read=await requestLanguagePolicy(),resolved=routingLanguagePolicy(read,()=>configuredLocalePolicy(loadConfig()));
 if(resolved.kind==='unavailable')throw new Error('language_policy_unavailable');return resolved.policy;
}
export async function languageBusinessHeaders():Promise<Record<string,string>>{
 const read=await requestLanguagePolicy();if(read.kind==='unavailable')throw new Error('language_policy_unavailable');
 return read.kind==='runtime'?{'X-Site-Language-Contract':'1','X-Site-Language-Revision':read.policy.publicRevision}:{};
}
export function isLanguagePolicyChanged(error:unknown):boolean{return error instanceof Error&&'code'in error&&error.code==='language_policy_changed';}
/** Restart a whole public projection once. Successful fragments from the first attempt are discarded. */
export async function withResolvedLanguageRequest<T>(work:()=>Promise<T>):Promise<T>{
 const initial=await readRuntimeLanguagePolicy();
 try{return await withRuntimeLanguageRequest(initial,work);}
 catch(error){if(!isLanguagePolicyChanged(error))throw error;const fresh=await readRuntimeLanguagePolicy(true);return withRuntimeLanguageRequest(fresh,work);}
}
/** JSON route boundary: preserve explicit unavailability after the single allowed retry. */
export async function withPublicLanguageRequest(work:()=>Promise<Response>):Promise<Response>{
 try{return await withResolvedLanguageRequest(work);}
 catch(error){const changed=isLanguagePolicyChanged(error);return Response.json({error:{code:changed?'language_policy_changed':'language_policy_unavailable'}},{status:changed?409:503,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
}
