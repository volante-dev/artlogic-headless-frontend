import {describe,it,expect} from 'vitest';
import {destination,navigationHrefKey,readHistory,historyDecision,commitDecision,requestRefresh} from '../../lib/header/navigation-state';
const intent={generation:2,entryId:'entry',target:'/contact',source:'history' as const,baselineRequestId:'old',refreshRequested:false,deadline:10000};
describe('header navigation safety',()=>{
 it('keeps native destinations and refuses executable/protocol-relative URLs',()=>{
  expect(destination('javascript:alert(1)','https://fixture.test/')).toBeNull();
  expect(destination('//outside.test/a','https://fixture.test/')).toBeNull();
  expect(destination('https://outside.test/a','https://fixture.test/')?.kind).toBe('external');
  expect(destination('/contact?q=a#form','https://fixture.test/')?.href).toBe('/contact?q=a#form');
  expect(destination('/#about','https://fixture.test/')?.kind).toBe('same-document');
 });
 it('requires fresh proof after restoration and ignores wrong targets or generations',()=>{
  expect(commitDecision(intent,{hrefKey:'/contact',requestId:'old'},'/contact',2,new Set(['old']))).toBe('refresh');
  expect(commitDecision(intent,{hrefKey:'/contact',requestId:'fresh'},'/contact',2,new Set(['old']))).toBe('accept');
  expect(commitDecision(intent,{hrefKey:'/news',requestId:'late'},'/contact',2,new Set())).toBe('ignore');
  expect(commitDecision(intent,{hrefKey:'/contact',requestId:'late'},'/contact',1,new Set())).toBe('ignore');
 });
 it('bounds automatic refresh and rejects malformed history versions',()=>{
  expect(requestRefresh(intent)?.refreshRequested).toBe(true);
  expect(requestRefresh({...intent,refreshRequested:true})).toBeNull();
  expect(readHistory({__siteHeaderNavigation:{version:2,entryId:'a',hrefKey:'/'}})).toBeNull();
 });
});
it('treats a retained render reached through a new link as stale, even without a history baseline',()=>{
 const intent={generation:4,entryId:'new-entry',target:'/news',source:'header' as const,refreshRequested:false,deadline:10000};
 expect(commitDecision(intent,{hrefKey:'/news',requestId:'consumed'},'/news',4,new Set(['consumed']))).toBe('refresh');
 expect(commitDecision(intent,{hrefKey:'/news',requestId:'fresh'},'/contact',4,new Set())).toBe('ignore');
});
it('preserves the deadline and target when scheduling the only automatic refresh',()=>{
 const intent={generation:4,entryId:'entry',target:'/news',source:'history' as const,refreshRequested:false,deadline:10000};
 expect(requestRefresh(intent)).toEqual({...intent,refreshRequested:true});expect(intent.refreshRequested).toBe(false);
 expect(readHistory({__NA:true,artlogicArtworkVisit:'visit',__siteHeaderNavigation:{version:1,entryId:'entry',hrefKey:'/news',lastRequestId:'nonce'}})).toEqual({version:1,entryId:'entry',hrefKey:'/news',lastRequestId:'nonce'});
 expect(readHistory({__siteHeaderNavigation:{version:1,entryId:3,hrefKey:'/news'}})).toBeNull();
});

it('normalizes history keys using the same allowed query rules as the server',()=>{const policy={defaultLocale:'fr',locales:[{code:'fr',label:'Français'}]};expect(navigationHrefKey('/artworks?pageSize=3&page=1','https://fixture.test',policy)).toBe(navigationHrefKey('/artworks?page=1&pageSize=3','https://fixture.test',policy));expect(navigationHrefKey('/?utm_source=test','https://fixture.test',policy)).toBe('/');});
it('requires a refresh before trusting a retry whose pending request was never confirmed',()=>{const intent={generation:5,entryId:'retry',target:'/contact',source:'history' as const,refreshRequested:false,deadline:10000};expect(commitDecision(intent,{hrefKey:'/contact',requestId:'unconfirmed'},'/contact',5,new Set())).toBe('refresh');expect(commitDecision({...intent,refreshRequested:true},{hrefKey:'/contact',requestId:'fresh'},'/contact',5,new Set(['unconfirmed']))).toBe('accept');});

it('refreshes unknown managed history while leaving anchors and unmanaged entries alone',()=>{expect(historyDecision({__siteHeaderNavigation:{version:99}},'/news',null)).toEqual({kind:'fresh'});expect(historyDecision({},'/news',null)).toEqual({kind:'ignore'});expect(historyDecision({__siteHeaderNavigation:{version:1,entryId:'same',hrefKey:'/contact'}},'/contact','same')).toEqual({kind:'ignore'});expect(historyDecision({__siteHeaderNavigation:{version:1,entryId:'different',hrefKey:'/contact',lastRequestId:'old'}},'/contact','same')).toEqual({kind:'restore',entry:{version:1,entryId:'different',hrefKey:'/contact',lastRequestId:'old'}});});
