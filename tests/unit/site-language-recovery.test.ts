import {beforeEach,describe,it,expect,vi} from 'vitest';
vi.mock('server-only',()=>({}));
const {read,fetcher}=vi.hoisted(()=>({read:vi.fn(),fetcher:vi.fn()}));
vi.mock('../../lib/i18n/runtime-policy',()=>({readRuntimeLanguagePolicy:read}));
vi.mock('../../lib/api/client',async original=>({...await original<typeof import('../../lib/api/client')>(),publicFetch:fetcher}));
vi.mock('../../lib/config/env',()=>({loadConfig:()=>({}),configuredLocalePolicy:()=>({defaultLocale:'fr',locales:[{code:'fr',label:'Français'},{code:'en',label:'English'}]})}));
import {withResolvedLanguageRequest,withPublicLanguageRequest,languageBusinessHeaders,requestRoutingPolicy} from '../../lib/i18n/request-language';
import {PublicApiError} from '../../lib/api/client';
import {GET} from '../../app/api/artwork-experiences/[artworkRef]/route';
const id='50000000-0000-4000-8000-000000000001',siteId='96d6d267-84aa-4a5f-a9b6-d1a191724c19';
const runtime=(revision='2')=>({kind:'runtime',remainingMs:20000,policy:{contractVersion:1,siteId,mode:'managed',publicRevision:revision,defaultLocale:'fr',locales:[{code:'fr',intlLocale:'fr',label:'Français',direction:'ltr'},{code:'it',intlLocale:'it',label:'Italiano',direction:'ltr'}],retiredCodes:['en'],catalogueId:'synthetic',issuedAt:new Date().toISOString(),validUntil:new Date(Date.now()+30000).toISOString()}});
const document={scope:'public',artwork:{id,slug:'etude-'+id.replaceAll('-',''),title:'Synthetic',artist:null,year:null,medium:null,dimensions:null,media:[]},locale:'it',description:null,descriptionLocale:null,presentationReleaseId:null,catalogRevision:1};
beforeEach(()=>{vi.clearAllMocks();read.mockResolvedValue(runtime());});
describe('US3 whole-projection language revision recovery',()=>{
 it('accepts a newly active runtime locale on a direct BFF without trusting the environment or browser headers',async()=>{
  const contexts:string[]=[];fetcher.mockImplementation(async()=>{contexts.push((await languageBusinessHeaders())['X-Site-Language-Revision']!);return Response.json(document);});
  const result=await GET(new Request('https://frontend.example.test/api/artwork-experiences/'+id+'?locale=it',{headers:{'x-site-language-context':'forged','x-site-locale':'fr'}}),{params:Promise.resolve({artworkRef:id})});expect(result.status).toBe(200);expect((await result.json()).locale).toBe('it');expect(contexts).toEqual(['2']);expect(read).toHaveBeenCalledTimes(1);
 });
 it('restarts the entire projection once after a revision refusal, rebuilding every business header',async()=>{
  read.mockResolvedValueOnce(runtime('1')).mockResolvedValueOnce(runtime('2'));const contexts:string[]=[],work=vi.fn(async()=>{const revision=(await languageBusinessHeaders())['X-Site-Language-Revision']!;contexts.push(revision,revision);if(revision==='1')throw new PublicApiError(409,'language_policy_changed');return requestRoutingPolicy();});
  expect((await withResolvedLanguageRequest(work)).locales.map(locale=>locale.code)).toEqual(['fr','it']);expect(work).toHaveBeenCalledTimes(2);expect(contexts).toEqual(['1','1','2','2']);expect(read.mock.calls).toEqual([[],[true]]);
 });
 it('never loops on a second revision refusal and never retries an unrelated catalogue conflict',async()=>{
  const work=vi.fn(async()=>{throw new PublicApiError(409,'language_policy_changed');}),result=await withPublicLanguageRequest(work);expect(result.status).toBe(409);expect((await result.json()).error.code).toBe('language_policy_changed');expect(work).toHaveBeenCalledTimes(2);
  read.mockClear();const catalogue=vi.fn(async()=>{throw new PublicApiError(409,'catalog_changed');});await expect(withResolvedLanguageRequest(catalogue)).rejects.toMatchObject({code:'catalog_changed'});expect(catalogue).toHaveBeenCalledTimes(1);expect(read).toHaveBeenCalledTimes(1);
 });
 it('does not revive environment locales during a runtime outage or accept an inactive old locale',async()=>{
  read.mockResolvedValueOnce({kind:'unavailable',reason:'access_denied'});const result=await GET(new Request('https://frontend.example.test/api/artwork-experiences/'+id+'?locale=en'),{params:Promise.resolve({artworkRef:id})});expect(result.status).toBe(503);expect(fetcher).not.toHaveBeenCalled();
  const retired=await GET(new Request('https://frontend.example.test/api/artwork-experiences/'+id+'?locale=en'),{params:Promise.resolve({artworkRef:id})});expect(retired.status).toBe(404);expect(fetcher).not.toHaveBeenCalled();
 });
});
