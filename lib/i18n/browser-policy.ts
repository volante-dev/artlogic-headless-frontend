import {decodeLanguagePolicy,languageLeaseRemaining,type PublicLanguagePolicy} from './language-policy-protocol';
import {boundedPolicyBody,type RuntimePolicyRead} from './runtime-policy-transport';
/** Event-driven freshness only. No polling timer and no browser wall-clock trust. */
export class BrowserLanguagePolicy{
 private highestRevision:string;
 private pending:Promise<RuntimePolicyRead>|undefined;
 constructor(private readonly options:{siteId:string;/** @deprecated Managed policy is always required. */ required?:boolean;initial?:PublicLanguagePolicy;fetch:typeof fetch;monotonic?:()=>number}){this.highestRevision=options.initial?.publicRevision??'0';}
 note(policy:PublicLanguagePolicy){if(BigInt(policy.publicRevision)>BigInt(this.highestRevision))this.highestRevision=policy.publicRevision;}
 async read():Promise<RuntimePolicyRead>{
  if(this.pending)return this.pending;const pending=this.load();this.pending=pending;try{return await pending;}finally{if(this.pending===pending)this.pending=undefined;}
 }
 private async load():Promise<RuntimePolicyRead>{
  const monotonic=this.options.monotonic??(()=>performance.now()),started=monotonic();
  try{
   const response=await this.options.fetch('/api/languages/policy',{headers:{Accept:'application/json'},cache:'default',credentials:'omit',redirect:'error',signal:AbortSignal.timeout(8000)});
   if(response.status===404){await response.body?.cancel();return {kind:'unavailable',reason:'unavailable'};}
   if(response.status!==200){await response.body?.cancel();return {kind:'unavailable',reason:[401,403].includes(response.status)?'access_denied':'unavailable'};}
   if(response.headers.has('set-cookie')||response.headers.has('etag')||!response.headers.get('content-type')?.includes('application/json')){await response.body?.cancel();return {kind:'unavailable',reason:'invalid_response'};}
   const policy=decodeLanguagePolicy(JSON.parse(await boundedPolicyBody(response)),this.options.siteId),remainingMs=languageLeaseRemaining(policy,response.headers,monotonic()-started);if(remainingMs<=0||BigInt(policy.publicRevision)<BigInt(this.highestRevision))return {kind:'unavailable',reason:'expired'};this.note(policy);return {kind:'runtime',policy,remainingMs};
  }catch{return {kind:'unavailable',reason:'unavailable'};}
 }
}
