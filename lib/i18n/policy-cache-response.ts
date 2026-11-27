import {boundedPolicyBody} from './runtime-policy-transport';
import {decodeLanguagePolicy,languageLeaseRemaining} from './language-policy-protocol';
const privateHeaders={'Cache-Control':'private, no-store','Vercel-CDN-Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff'};
/** This endpoint never forwards a visitor header or resets an upstream lease. */
export async function languagePolicyCacheResponse(options:{backendUrl:string;siteId:string;fetch:typeof fetch;monotonic?:()=>number}):Promise<Response>{
 const now=options.monotonic??(()=>performance.now()),started=now();
 const failure=(status:number)=>Response.json({error:{code:status===404?'language_capability_absent':'language_policy_unavailable'}},{status,headers:privateHeaders});
 try{
  const endpoint=new URL('/v1/public/languages/policy',options.backendUrl);
  const upstream=await options.fetch(endpoint,{method:'GET',headers:{Accept:'application/json'},credentials:'omit',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(8000)});
  if(upstream.status!==200){await upstream.body?.cancel();return failure(upstream.status===404?404:503);}
  if(upstream.headers.has('set-cookie')||upstream.headers.has('etag')||!upstream.headers.get('content-type')?.includes('application/json')){await upstream.body?.cancel();return failure(503);}
  const policy=decodeLanguagePolicy(JSON.parse(await boundedPolicyBody(upstream)),options.siteId),elapsed=now()-started;
  const remaining=languageLeaseRemaining(policy,upstream.headers,elapsed);if(remaining<=0)return failure(503);
  const ttl=Math.min(10,Math.floor(remaining/1000));
  // Preserve upstream Date and increase Age for time spent here, instead of stamping a new issuance date.
  const age=Number(upstream.headers.get('age')??'0')+Math.ceil(elapsed/1000);
  return Response.json(policy,{status:200,headers:{'Cache-Control':'public, max-age=0, must-revalidate','Vercel-CDN-Cache-Control':ttl>0?`public, max-age=${ttl}, must-revalidate`:'no-store','Date':upstream.headers.get('date')!,'Age':String(age),'X-Content-Type-Options':'nosniff'}});
 }catch{return failure(503);}
}
