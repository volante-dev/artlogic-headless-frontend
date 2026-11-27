import {archivedRuntimeMessageCatalogues} from '../../lib/i18n/message-archives.generated';
import {describe,it,expect,vi,afterEach} from 'vitest';
vi.mock('server-only',()=>({}));
const {runtime}=vi.hoisted(()=>({runtime:vi.fn()}));
vi.mock('../../lib/i18n/request-language',()=>({requestLanguagePolicy:runtime,languageBusinessHeaders:async()=>({})}));
vi.mock('../../lib/config/env',()=>({loadConfig:()=>({SITE_ID:'b962c7de-ab47-4c04-a424-caa8d0103bfe',BACKEND_URL:'https://api.example.test'}),stringValue:(config:Record<string,string>,key:string)=>config[key],numberValue:()=>45000,configuredLocalePolicy:()=>({defaultLocale:'fr',locales:[{code:'fr',label:'FR'},{code:'en',label:'EN'}]}),canonicalJson:(value:unknown)=>JSON.stringify(value)}));
import {getSiteContent} from '../../lib/api/site-content';
import {initialMessages} from '../../lib/i18n/messages.generated';
import {runtimeMessageDefinitions,runtimeMessageCatalogueId} from '../../lib/i18n/message-definitions.generated';
const policy={contractVersion:1,siteId:'b962c7de-ab47-4c04-a424-caa8d0103bfe',mode:'managed',publicRevision:'7',defaultLocale:'fr',locales:[{code:'fr',intlLocale:'fr',label:'Français',direction:'ltr'},{code:'it',intlLocale:'it',label:'Italiano',direction:'ltr'}],retiredCodes:['en'],catalogueId:'synthetic-policy',issuedAt:'2026-11-25T12:00:00Z',validUntil:'2026-11-25T12:00:30Z'};
afterEach(()=>vi.restoreAllMocks());
describe('US3 SSR runtime site content bridge',()=>{
 it('reads the selected registered catalogue and decimal revision without restoring environment locales',async()=>{
  runtime.mockResolvedValue({kind:'runtime',policy,remainingMs:10000});vi.spyOn(console,'info').mockImplementation(()=>{});
  const fetcher=vi.spyOn(globalThis,'fetch').mockImplementation(async input=>{const url=new URL(String(input));expect(url.pathname).toBe('/v1/public/languages/content');expect(url.searchParams.get('revision')).toBe('7');expect(url.searchParams.get('locale')).toBe('it');return Response.json({contractVersion:1,contentRevision:'19',locale:'it',policy,selectedCatalogueId:url.searchParams.get('catalogue'),messages:Object.fromEntries(runtimeMessageDefinitions.filter(message=>message.module==='core').map(message=>[message.id,'Synthetic '+message.id+Object.keys(message.parameters).map(parameter=>' {'+parameter+'}').join('')])),logo:null,whiteLogo:null,legalPage:null});});
  const site=await getSiteContent('it');expect(site.revision).toBe('19');expect(site.locale).toBe('it');expect(site.policy.locales.map(value=>value.code)).toEqual(['fr','it']);expect(site.messages['nav.news']).toBe('Synthetic nav.news');expect(fetcher).toHaveBeenCalledTimes(1);expect(site.runtime?.catalogueId).toBe(runtimeMessageCatalogueId);expect(site.runtime?.modules).toEqual(['core']);expect(site.messages['commerce.cart']).toBeUndefined();
 });
 it('negotiates the registered N-1 runtime catalogue for an authored third language without any English fallback',async()=>{
  runtime.mockResolvedValue({kind:'runtime',policy,remainingMs:10000});vi.spyOn(console,'info').mockImplementation(()=>{});const archive=archivedRuntimeMessageCatalogues.find(value=>String(value.id)!==runtimeMessageCatalogueId)!;expect(archive).toBeTruthy();const fetcher=vi.spyOn(globalThis,'fetch').mockImplementation(async input=>{const url=new URL(String(input));if(url.searchParams.get('catalogue')===runtimeMessageCatalogueId)return Response.json({error:{code:'capability_unavailable',details:[{field:'catalogue',reason:'unsupported_catalogue'}]}},{status:503});expect(url.searchParams.get('catalogue')).toBe(archive.id);return Response.json({contractVersion:1,contentRevision:'19',locale:'it',policy,selectedCatalogueId:archive.id,messages:Object.fromEntries(archive.definitions.filter(message=>message.module==='core').map(message=>[message.id,'Contributed '+message.id+Object.keys(message.parameters).map(parameter=>' {'+parameter+'}').join('')])),logo:null,whiteLogo:null,legalPage:null});});
  const site=await getSiteContent('it');expect(site.runtime?.catalogueId).toBe(archive.id);expect(site.messages['nav.news']).toBe('Contributed nav.news');expect(site.messages['commerce.cart']).toBeUndefined();expect(fetcher).toHaveBeenCalledTimes(2);
 });
 it('does not use the legacy content endpoint when the runtime policy is unavailable',async()=>{
  runtime.mockResolvedValue({kind:'unavailable',reason:'expired'});const fetcher=vi.spyOn(globalThis,'fetch');await expect(getSiteContent('it')).rejects.toMatchObject({status:503,code:'language_policy_unavailable'});expect(fetcher).not.toHaveBeenCalled();
 });
 it('uses a previous catalogue only after its explicit unsupported-catalogue receipt, never for authorization or availability errors',async()=>{
  runtime.mockResolvedValue({kind:'runtime',policy,remainingMs:10000});vi.spyOn(console,'info').mockImplementation(()=>{});
  const fetcher=vi.spyOn(globalThis,'fetch').mockImplementation(async input=>{const url=new URL(String(input));if(url.searchParams.get('catalogue')?.startsWith('runtime-038-'))return Response.json({error:{code:'capability_unavailable',details:[{field:'catalogue',reason:'unsupported_catalogue'}]}},{status:503});expect(url.searchParams.get('catalogue')).toMatch(/^legacy-002-/);return Response.json({contractVersion:1,contentRevision:'19',locale:'fr',policy,selectedCatalogueId:url.searchParams.get('catalogue'),messages:initialMessages('fr'),logo:null,whiteLogo:null,legalPage:null});});
  const legacy=await getSiteContent('fr');expect(legacy.runtime).toBeUndefined();expect(legacy.messages['nav.news']).toBe(initialMessages('fr')['nav.news']);expect(fetcher).toHaveBeenCalledTimes(3);
  for(const status of [401,403,503]){fetcher.mockClear();fetcher.mockResolvedValue(Response.json({error:{code:'service_unavailable'}},{status}));await expect(getSiteContent('fr')).rejects.toMatchObject({status:503});expect(fetcher).toHaveBeenCalledTimes(1);}
 });

});
