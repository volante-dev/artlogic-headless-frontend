import {test,expect,type BrowserContext} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {runtimeMessageCatalogueId} from '../lib/i18n/message-definitions.generated';
async function fixture(context:BrowserContext){
 const file=process.env.E2E_LANGUAGES_FIXTURE;if(!file)throw new Error('Start the local site language harness.');const value=JSON.parse(await readFile(file,'utf8')) as {siteId:string;siteOrigin:string;adminOrigin:string;publicArticlePath?:string};
 if(!['127.0.0.1','localhost'].includes(new URL(value.siteOrigin).hostname))throw new Error('Only the local language harness is allowed.');void context;return value;
}
test.describe('US2 runtime language foundation in real SSR',()=>{
 test('renders the public frame and reads locale content through the decimal-revision runtime bridge',async({page,context})=>{
  const data=await fixture(context);const response=await page.goto(data.siteOrigin+'/');expect(response?.status()).toBe(200);await expect(page.locator('html')).toHaveAttribute('lang','fr');await expect(page.getByRole('main')).toHaveAttribute('data-header-state','ready');
  const localized=await page.request.get(data.siteOrigin+'/api/site-locale?locale=fr&pageKey=home');expect(localized.status()).toBe(200);const body=await localized.json();expect(body.locale).toBe('fr');expect(body.messages['nav.news']).toBeTruthy();expect(body.runtime.catalogueId).toBe(runtimeMessageCatalogueId);expect(body.runtime.modules).toContain('core');expect(body.messages['core.readWithoutJavaScript']).toBe('Lire cet article sans JavaScript');expect(body.presentation.locale).toBe('fr');
  const policy=await page.request.get(data.siteOrigin+'/api/languages/policy');expect(policy.status()).toBe(200);expect((await policy.json()).locales.map((locale:{code:string})=>locale.code)).toEqual(['fr','en']);
 });
 test('preserves a legacy public locale while refusing forged internal locale context',async({page,context})=>{
  const data=await fixture(context);const response=await page.goto(data.siteOrigin+'/en/artworks');expect(response?.status()).toBe(200);await expect(page.locator('html')).toHaveAttribute('lang','en');await expect(page.getByRole('main')).toHaveAttribute('data-header-state','ready');
  const unknown=await page.request.get(data.siteOrigin+'/ar/artworks',{headers:{'x-site-locale':'en','x-site-language-context':'forged','x-site-language-mode':'legacy'}});expect(unknown.status()).toBe(404);
 });
 test('keeps the native reader link and contributed interface text in server HTML without JavaScript',async({browser,context})=>{
  const data=await fixture(context);expect(data.publicArticlePath).toBeTruthy();const native=await browser.newContext({javaScriptEnabled:false});try{const page=await native.newPage(),response=await page.goto(data.siteOrigin+data.publicArticlePath);expect(response?.status()).toBe(200);await expect(page.locator('html')).toHaveAttribute('lang','fr');await expect(page.locator('#editorial-native-link')).toHaveText('Lire cet article sans JavaScript');await expect(page.locator('#editorial-native-link')).toHaveAttribute('href','?reader=native');await page.locator('#editorial-native-link').click();await expect(page).toHaveURL(/reader=native/);await expect(page.getByRole('heading',{name:'Version publique',exact:true})).toBeVisible();}finally{await native.close();}
 });

});
test.describe('US3 browser policy refresh and bounded recovery',()=>{
 test('a slow header navigation issues one RSC request without a timer refresh',async({page,context})=>{
  const data=await fixture(context);await page.goto(data.siteOrigin+'/artworks');await expect(page.getByRole('main')).toHaveAttribute('data-header-state','ready');let requests=0;
  await page.route('**/contact?*',async route=>{if(new URL(route.request().url()).searchParams.has('_rsc')){requests++;await new Promise(resolve=>setTimeout(resolve,750));}await route.continue();});
  await page.locator('header a[href="/contact"]').first().click();await expect(page).toHaveURL(/\/contact$/);await expect(page.getByRole('main')).toHaveAttribute('data-header-state','ready');await page.waitForTimeout(300);expect(requests).toBe(1);await expect(page.locator('header a[href="/contact"]').first()).toHaveAttribute('aria-current','page');
 });
 test('preserves the page and scroll on focus and visibility changes without refetching language policy',async({page,context})=>{
  const data=await fixture(context);await page.goto(data.siteOrigin+'/en/artworks');await expect(page.getByRole('main')).toHaveAttribute('data-header-state','ready');
  await page.evaluate(()=>window.scrollTo(0,100));const before=await page.evaluate(()=>({scroll:scrollY,lang:document.documentElement.lang,title:document.title}));
  let reads=0,documents=0;await page.route('**/api/languages/policy',route=>{reads++;return route.fulfill({status:503,json:{error:{code:'unexpected_focus_read'}}});});
  page.on('request',request=>{if(request.isNavigationRequest()&&request.resourceType()==='document')documents++;});
  await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));});
  await page.waitForTimeout(300);expect(reads).toBe(0);expect(documents).toBe(0);expect(await page.evaluate(()=>({scroll:scrollY,lang:document.documentElement.lang,title:document.title}))).toEqual(before);await expect(page.getByRole('main')).toHaveAttribute('data-header-state','ready');
 });
 test('reclassifies a refused locale once and leaves the current document intact, without a reload loop',async({page,context})=>{
  const data=await fixture(context);await page.goto(data.siteOrigin+'/artworks');await expect(page.getByRole('main')).toHaveAttribute('data-header-state','ready');const baseline=await (await page.request.get(data.siteOrigin+'/api/languages/policy')).json();let refused=false,reads=0,business=0,documents=0;
  page.on('request',request=>{if(request.isNavigationRequest()&&request.resourceType()==='document')documents++;});
  await page.route('**/api/languages/policy',route=>{reads++;const at=new Date();return route.fulfill({headers:{'Content-Type':'application/json',Date:at.toUTCString(),Age:'0'},json:{...baseline,mode:'managed',publicRevision:refused?'10':'9',locales:refused?baseline.locales.filter((locale:{code:string})=>locale.code==='fr'):baseline.locales,retiredCodes:refused?['en']:[],issuedAt:at.toISOString(),validUntil:new Date(at.getTime()+30000).toISOString()}});});
  await page.route('**/api/site-locale?**',route=>{business++;refused=true;return route.fulfill({status:409,json:{error:{code:'language_policy_changed'}}});});
  await page.getByRole('navigation',{name:'Langue'}).first().getByRole('link',{name:'English',exact:true}).click();await expect(async()=>expect(reads).toBeGreaterThanOrEqual(2)).toPass();expect(business).toBe(1);expect(documents).toBe(0);await expect(page.locator('html')).toHaveAttribute('lang','fr');await expect(page.getByRole('navigation',{name:'Langue'})).toHaveCount(0);await expect(page.getByRole('main')).toHaveAttribute('data-header-state','ready');
 });
});
