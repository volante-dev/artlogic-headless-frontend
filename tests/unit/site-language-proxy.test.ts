import {describe,it,expect,vi,beforeEach} from 'vitest';
import {NextRequest} from 'next/server';
const {read,resolveRetired}=vi.hoisted(()=>({read:vi.fn(),resolveRetired:vi.fn()}));
vi.mock('server-only',()=>({}));
vi.mock('../../lib/i18n/retired-path',()=>({resolveRetiredPath:resolveRetired}));
vi.mock('../../lib/i18n/runtime-policy',()=>({readRuntimeLanguagePolicy:read}));
vi.mock('../../lib/i18n/request-language',()=>({isLanguagePolicyChanged:(error:unknown)=>Boolean(error&&typeof error==='object'&&'code'in error&&error.code==='language_policy_changed'),withRuntimeLanguageRequest:(_read:unknown,work:()=>unknown)=>work()}));
vi.mock('../../lib/config/env',()=>({loadConfig:()=>({SITE_DEFAULT_LOCALE:'fr'}),configuredLocalePolicy:()=>({defaultLocale:'fr',locales:[{code:'fr',label:'FR'},{code:'en',label:'EN'}]}),listValue:()=>[]}));
import {proxy} from '../../proxy';
const siteId='b962c7de-ab47-4c04-a424-caa8d0103bfe';
const policy={contractVersion:1,siteId,mode:'managed',publicRevision:'7',defaultLocale:'fr',locales:[{code:'fr',intlLocale:'fr',label:'Français',direction:'ltr'},{code:'it',intlLocale:'it',label:'Italiano',direction:'ltr'}],retiredCodes:['en'],catalogueId:'synthetic',issuedAt:'2026-11-25T12:00:00Z',validUntil:'2026-11-25T12:00:30Z'};
beforeEach(()=>{read.mockReset();resolveRetired.mockReset();});
describe('US3 runtime proxy classification',()=>{
 it.each(['/api/languages/policy','/api/internal/languages/ready','/api/site-locale','/_next/static/chunk.js','/media/a3076c07-dcc2-4d2c-8ca7-61606db7f95b','/favicon.ico'])('bypasses policy resolution for %s and strips forged internal headers',async path=>{
  const response=await proxy(new NextRequest('https://frontend.example.test'+path,{headers:{'x-site-language-context':'forged','x-site-language-mode':'legacy','x-site-locale':'ar'}}));expect(read).not.toHaveBeenCalled();expect(response.headers.get('x-middleware-request-x-site-language-context')).toBeNull();expect(response.headers.get('x-middleware-request-x-site-locale')).toBeNull();
 });
 it('classifies an active runtime locale and carries only the sanitized request projection',async()=>{
  read.mockResolvedValue({kind:'runtime',policy,remainingMs:10000});const response=await proxy(new NextRequest('https://frontend.example.test/it/artworks',{headers:{'x-site-language-context':'forged'}}));
  expect(read).toHaveBeenCalledTimes(1);expect(response.headers.get('x-middleware-rewrite')).toBe('https://frontend.example.test/it/artworks');expect(response.headers.get('x-middleware-request-x-site-locale')).toBe('it');
  const carried=JSON.parse(Buffer.from(response.headers.get('x-middleware-request-x-site-language-context')!,'base64url').toString('utf8'));expect(carried.policy.publicRevision).toBe('7');expect(carried.policy).not.toHaveProperty('retiredCodes');
 });
 it('keeps only the main-language frame on an unavailable policy, with no environment secondary or false 404',async()=>{
  read.mockResolvedValue({kind:'unavailable',reason:'access_denied'});const response=await proxy(new NextRequest('https://frontend.example.test/en/artworks'));
  expect(response.status).toBe(503);expect(response.headers.get('x-middleware-rewrite')).toBe('https://frontend.example.test/fr');expect(response.headers.get('x-middleware-request-x-site-locale')).toBe('fr');expect(response.headers.get('x-middleware-request-x-site-language-unavailable')).toBe('1');expect(response.headers.get('cache-control')).toBe('private, no-store');
 });
 it('uses the previous locale policy only after a confirmed legacy read',async()=>{
  read.mockResolvedValue({kind:'legacy'});const response=await proxy(new NextRequest('https://frontend.example.test/en/artworks'));expect(response.headers.get('x-middleware-request-x-site-locale')).toBe('en');expect(response.headers.get('x-middleware-request-x-site-language-mode')).toBe('legacy');
 });
});

describe('US4 retired route navigation',()=>{
 it.each([{}, {rsc:'1'}])('uses the same identity resolver and private reversible redirect for SSR/client %j',async headers=>{
  read.mockResolvedValue({kind:'runtime',policy,remainingMs:10000});resolveRetired.mockResolvedValue('/publications/current?reader=native');const result=await proxy(new NextRequest('https://frontend.example.test/en/publications/old?reader=native&_rsc=abc',{headers:new Headers(headers as Record<string,string>)}));
  expect(result.status).toBe(307);expect(result.headers.get('location')).toBe('https://frontend.example.test/publications/current?reader=native');expect(result.headers.get('cache-control')).toBe('private, no-store');expect(resolveRetired).toHaveBeenCalledWith('/en/publications/old?reader=native',policy);
 });
 it('refreshes the whole policy once after a retirement revision race',async()=>{
  read.mockResolvedValueOnce({kind:'runtime',policy,remainingMs:10000}).mockResolvedValueOnce({kind:'runtime',policy:{...policy,publicRevision:'8'},remainingMs:10000});resolveRetired.mockRejectedValueOnce(Object.assign(new Error(),{code:'language_policy_changed'})).mockResolvedValue('/contact');
  expect((await proxy(new NextRequest('https://frontend.example.test/en/contact'))).status).toBe(307);expect(read.mock.calls).toEqual([[false],[true]]);expect(resolveRetired).toHaveBeenCalledTimes(2);
 });
 it('closes on resolver failure and never falls back to a false not-found',async()=>{read.mockResolvedValue({kind:'runtime',policy,remainingMs:10000});resolveRetired.mockRejectedValue(new Error('dependency'));const result=await proxy(new NextRequest('https://frontend.example.test/en/contact'));expect(result.status).toBe(503);expect(result.headers.get('location')).toBeNull();});
});
