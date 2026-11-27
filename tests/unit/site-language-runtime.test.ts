import {routingLanguagePolicy,encodeLanguageRequest,decodeLanguageRequest} from '../../lib/i18n/runtime-routing';
import {decodeLanguagePolicy} from '../../lib/i18n/language-policy-protocol';
import {describe,it,expect,vi} from 'vitest';
import {RuntimePolicyTransport} from '../../lib/i18n/runtime-policy-transport';
import {languagePolicyCacheResponse} from '../../lib/i18n/policy-cache-response';
const siteId='b962c7de-ab47-4c04-a424-caa8d0103bfe';
const issued='2026-11-24T12:00:00.000Z';
const body={contractVersion:1,siteId,mode:'managed',publicRevision:'1',defaultLocale:'fr',locales:[{code:'fr',intlLocale:'fr',label:'Français',direction:'ltr'}],retiredCodes:[],catalogueId:'legacy-test',issuedAt:issued,validUntil:'2026-11-24T12:00:30.000Z'};
const response=(value=body,headers:Record<string,string>={})=>Response.json(value,{headers:{Date:'Tue, 24 Nov 2026 12:00:00 GMT',...headers}});
const options={siteId,cacheOrigin:'https://frontend.example.test',backendOrigin:'https://api.example.test',required:false,allowLoopbackHttp:false};
describe('US3 runtime language policy transport',()=>{
 it('uses only the configured anonymous endpoint and expires L1 without rearming the lease',async()=>{
  let clock=0;const fetcher=vi.fn<typeof fetch>().mockImplementation(async()=>response(body,{Age:'10'}));
  const transport=new RuntimePolicyTransport({...options,fetch:fetcher,monotonic:()=>clock});
  const first=await transport.read();expect(first.kind).toBe('runtime');if(first.kind==='runtime')expect(first.remainingMs).toBe(19000);
  clock=4000;const hit=await transport.read();expect(fetcher).toHaveBeenCalledTimes(1);if(hit.kind==='runtime')expect(hit.remainingMs).toBe(15000);
  clock=5001;await transport.read();expect(fetcher).toHaveBeenCalledTimes(2);
  const [url,init]=fetcher.mock.calls[0]!;expect(url).toBe(options.cacheOrigin+'/api/languages/policy');expect(init).toMatchObject({credentials:'omit',cache:'default',next:{revalidate:0},redirect:'error',headers:{Accept:'application/json'}});expect(Object.keys(init!.headers!)).toEqual(['Accept']);
 });
 it('forces a fresh observation without allowing an older in-flight response to replace it',async()=>{
  let finishOld!:(response:Response)=>void;const fetcher=vi.fn<typeof fetch>().mockImplementationOnce(()=>new Promise<Response>(resolve=>{finishOld=resolve;})).mockImplementationOnce(async()=>response({...body,publicRevision:'2'}));
  const transport=new RuntimePolicyTransport({...options,fetch:fetcher});const old=transport.read();const fresh=await transport.read(true);expect(fresh.kind==='runtime'&&fresh.policy.publicRevision).toBe('2');finishOld(response());await old;const hit=await transport.read();expect(hit.kind==='runtime'&&hit.policy.publicRevision).toBe('2');expect(fetcher).toHaveBeenCalledTimes(2);
 });
 it('requires the managed policy even when the deprecated flag is false',async()=>{
  let clock=0;const fetcher=vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(null,{status:404})).mockImplementationOnce(async()=>response()).mockResolvedValueOnce(new Response(null,{status:404}));
  const transport=new RuntimePolicyTransport({...options,fetch:fetcher,monotonic:()=>clock});
  expect(await transport.read()).toEqual({kind:'unavailable',reason:'unavailable'});expect((await transport.read()).kind).toBe('runtime');clock=6000;
  expect(await transport.read()).toEqual({kind:'unavailable',reason:'unavailable'});
  const required=new RuntimePolicyTransport({...options,required:true,fetch:async()=>new Response(null,{status:404})});expect((await required.read()).kind).toBe('unavailable');
 });
 it.each([401,403,503,304])('does not interpret HTTP %s as a missing capability',async status=>{
  const transport=new RuntimePolicyTransport({...options,fetch:async()=>new Response(null,{status})});expect((await transport.read()).kind).toBe('unavailable');
 });
 it('rejects redirects, recursion, untrusted origins, cookies, stale and oversized payloads',async()=>{
  for(const cacheOrigin of [options.backendOrigin,'http://frontend.example.test','https://a:b@frontend.example.test','https://frontend.example.test/path'])expect(()=>new RuntimePolicyTransport({...options,cacheOrigin,fetch})).toThrow();
  for(const read of [()=>response(body,{'Set-Cookie':'private=value'}),()=>response(body,{'ETag':'"1"'}),()=>response(body,{Age:'30'}),()=>new Response('x'.repeat(65537),{headers:{Date:'Tue, 24 Nov 2026 12:00:00 GMT','Content-Type':'application/json'}})]){
   const transport=new RuntimePolicyTransport({...options,fetch:async()=>read()});expect((await transport.read()).kind).toBe('unavailable');
  }
 });
});
describe('US3 anonymous policy cache endpoint',()=>{
 it('preserves issuance and Date/Age, limits CDN TTL and never sends credentials upstream',async()=>{
  let clock=0;const fetcher=vi.fn<typeof fetch>().mockImplementation(async()=>{clock=1200;return response(body,{Age:'20'});});
  const result=await languagePolicyCacheResponse({backendUrl:options.backendOrigin,siteId,fetch:fetcher,monotonic:()=>clock});
  expect(result.status).toBe(200);expect(await result.json()).toEqual(body);expect(result.headers.get('date')).toBe('Tue, 24 Nov 2026 12:00:00 GMT');expect(result.headers.get('age')).toBe('22');
  expect(result.headers.get('vercel-cdn-cache-control')).toBe('public, max-age=7, must-revalidate');expect(result.headers.has('etag')).toBe(false);expect(result.headers.has('set-cookie')).toBe(false);
  expect(fetcher.mock.calls[0]![1]).toMatchObject({cache:'no-store',redirect:'error',credentials:'omit',headers:{Accept:'application/json'}});
 });
 it.each([404,403,503])('does not cache an upstream HTTP %s failure',async status=>{
  const result=await languagePolicyCacheResponse({backendUrl:options.backendOrigin,siteId,fetch:async()=>new Response(null,{status})});expect(result.status).toBe(status===404?404:503);expect(result.headers.get('cache-control')).toBe('private, no-store');expect(result.headers.get('vercel-cdn-cache-control')).toBe('no-store');
 });
 it('rejects expired policies and the wrong site before cache admission',async()=>{
  for(const upstream of [response(body,{Age:'31'}),response({...body,siteId:'259bb790-ec62-40b8-9e12-f923e34ee502'})]){
   const result=await languagePolicyCacheResponse({backendUrl:options.backendOrigin,siteId,fetch:async()=>upstream});expect(result.status).toBe(503);expect(result.headers.get('vercel-cdn-cache-control')).toBe('no-store');
  }
 });
});

describe('US3 runtime routing boundary',()=>{
 it('never resurrects environment secondaries on failure and preserves active order and labels',()=>{
  const legacy=vi.fn(()=>({defaultLocale:'fr',locales:[{code:'fr',label:'FR'},{code:'en',label:'EN'}]}));
  expect(routingLanguagePolicy({kind:'unavailable',reason:'access_denied'})).toEqual({kind:'unavailable',reason:'access_denied'});expect(legacy).not.toHaveBeenCalled();
  const policy=decodeLanguagePolicy({...body,locales:[...body.locales,{code:'it',intlLocale:'it',label:'Italiano',direction:'ltr'}]},siteId);
  const runtime=routingLanguagePolicy({kind:'runtime',policy,remainingMs:10000});expect(runtime.kind).toBe('ready');if(runtime.kind==='ready')expect(runtime.policy.locales.map(value=>value.code)).toEqual(['fr','it']);expect(legacy).not.toHaveBeenCalled();

 });
 it('carries a bounded request context without retired history and consumes its original lease',()=>{
  const policy=decodeLanguagePolicy({...body,retiredCodes:['en','pt-br']},siteId),encoded=encodeLanguageRequest(policy,7000,1000);
  expect(encoded.length).toBeLessThan(6000);expect(Buffer.from(encoded,'base64url').toString('utf8')).not.toContain('retiredCodes');
  const decoded=decodeLanguageRequest(encoded,siteId,2000);expect(decoded.remainingMs).toBe(6000);expect(decoded.policy.retiredCodes).toEqual([]);
  expect(()=>decodeLanguageRequest(encoded,siteId,8000)).toThrow();expect(()=>decodeLanguageRequest(encoded,'63af1f62-7e74-467c-ad0b-0baecf0fc9e7',2000)).toThrow();expect(()=>decodeLanguageRequest(encoded,siteId,0)).toThrow();
 });
});
