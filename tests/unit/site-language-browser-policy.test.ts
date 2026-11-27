import {describe,it,expect,vi} from 'vitest';
import {BrowserLanguagePolicy} from '../../lib/i18n/browser-policy';
import {decodeLanguagePolicy} from '../../lib/i18n/language-policy-protocol';
const siteId='55555555-5555-4555-8555-555555555555',value={contractVersion:1,siteId,mode:'managed',publicRevision:'3',defaultLocale:'fr',locales:[{code:'fr',intlLocale:'fr',label:'Français',direction:'ltr'},{code:'it',intlLocale:'it',label:'Italiano',direction:'ltr'}],retiredCodes:['en'],catalogueId:'synthetic',issuedAt:'2026-11-27T09:00:00.000Z',validUntil:'2026-11-27T09:00:30.000Z'};
const response=(policy=value,age='0')=>Response.json(policy,{headers:{date:'Fri, 27 Nov 2026 09:00:00 GMT',age}});
describe('US3 browser policy read only on explicit actions',()=>{
 it('bounds the lease with server Date/Age and monotonic elapsed time, without cookies or a browser clock',async()=>{
  let clock=0;const fetcher=vi.fn(async()=>{clock=100;return response(value,'10');}),reader=new BrowserLanguagePolicy({siteId,required:true,fetch:fetcher,monotonic:()=>clock});const observed=await reader.read();expect(observed.kind).toBe('runtime');if(observed.kind==='runtime')expect(observed.remainingMs).toBe(18900);expect(fetcher.mock.calls[0]).toMatchObject(['/api/languages/policy',{cache:'default',credentials:'omit',redirect:'error',headers:{Accept:'application/json'}}]);
 });
 it('deduplicates overlapping explicit reads and rechecks on the next action',async()=>{
  let finish!:(value:Response)=>void;const fetcher=vi.fn(()=>new Promise<Response>(resolve=>{finish=resolve;})),reader=new BrowserLanguagePolicy({siteId,required:true,fetch:fetcher});const first=reader.read(),second=reader.read();expect(fetcher).toHaveBeenCalledTimes(1);finish(response());expect((await first).kind).toBe('runtime');expect((await second).kind).toBe('runtime');const third=reader.read();expect(fetcher).toHaveBeenCalledTimes(2);finish(response());await third;
 });
 it('never downgrades on a 401/403/503 or after managed adoption, and never accepts a lower revision',async()=>{
  const fetcher=vi.fn().mockResolvedValueOnce(response()).mockResolvedValueOnce(new Response(null,{status:404})).mockResolvedValueOnce(response({...value,publicRevision:'2'}));const reader=new BrowserLanguagePolicy({siteId,required:false,fetch:fetcher});expect((await reader.read()).kind).toBe('runtime');expect((await reader.read()).kind).toBe('unavailable');expect((await reader.read()).kind).toBe('unavailable');
  for(const status of [401,403,503]){const fresh=new BrowserLanguagePolicy({siteId,required:false,fetch:async()=>new Response(null,{status})});expect((await fresh.read()).kind).toBe('unavailable');}
 });
 it('rejects a missing policy even with the deprecated flag false, and rejects stale or foreign payloads',async()=>{
  expect(await new BrowserLanguagePolicy({siteId,required:false,fetch:async()=>new Response(null,{status:404})}).read()).toEqual({kind:'unavailable',reason:'unavailable'});
  for(const result of [response(value,'30'),response({...value,siteId:'11111111-1111-4111-8111-111111111111'}),Response.json(value)])expect((await new BrowserLanguagePolicy({siteId,required:true,initial:decodeLanguagePolicy(value,siteId),fetch:async()=>result}).read()).kind).toBe('unavailable');
 });
});
