import {describe,it,expect} from 'vitest';
import {decodeLanguagePolicy,languageLeaseRemaining,LanguagePolicyLeaseCache} from '../../lib/i18n/language-policy-protocol';
const siteId='55555555-5555-4555-8555-555555555555';
const value={contractVersion:1,siteId,mode:'managed',publicRevision:'3',defaultLocale:'fr',locales:[{code:'fr',intlLocale:'fr',label:'Français',direction:'ltr'}],retiredCodes:['it'],catalogueId:'catalogue-1',issuedAt:'2026-11-24T12:00:00.000Z',validUntil:'2026-11-24T12:00:30.000Z'};
describe('public policy lease protocol',()=>{
 it('rejects private fields, wrong site, duplicate codes and unsupported versions',()=>{
  expect(decodeLanguagePolicy(value,siteId).publicRevision).toBe('3');
  for(const changed of [{...value,siteId:'11111111-1111-4111-8111-111111111111'},{...value,languages:[]},{...value,contractVersion:2},{...value,retiredCodes:['fr']},{...value,locales:[{...value.locales[0],state:'preparing'}]},{...value,locales:[value.locales[0],value.locales[0]]}])expect(()=>decodeLanguagePolicy(changed,siteId)).toThrow();
 });
 it('uses server Date/Age and elapsed monotonic time without the browser clock',()=>{
  const policy=decodeLanguagePolicy(value,siteId),headers=new Headers({date:'Tue, 24 Nov 2026 12:00:00 GMT',age:'10'});
  expect(languageLeaseRemaining(policy,headers,200)).toBe(18800);
  headers.set('age','30');expect(languageLeaseRemaining(policy,headers)).toBe(0);
  headers.set('age','-1');expect(()=>languageLeaseRemaining(policy,headers)).toThrow();
  expect(()=>languageLeaseRemaining(policy,new Headers())).toThrow();
 });
 it('does not rearm a lease on L1 hits and expires entries without tracking an optional mode',()=>{
  let now=0;const cache=new LanguagePolicyLeaseCache(()=>now),policy=decodeLanguagePolicy(value,siteId);cache.set('site',policy,10000);
  now=4900;expect(cache.get('site')?.remainingMs).toBe(5100);now=5001;expect(cache.get('site')).toBeNull();
  expect(Object.isFrozen(policy)).toBe(true);expect(Object.isFrozen(policy.locales)).toBe(true);
 });
});
