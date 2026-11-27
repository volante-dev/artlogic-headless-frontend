import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const site=()=>JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0];
async function dismissNotice(page:import('@playwright/test').Page){const button=page.getByRole('button',{name:'Compris',exact:true});if(await button.isVisible())await button.click();}

for(const origin of ['/','/artworks'])test(`opens from ${origin} with one route read and retains the origin on close`,async({page})=>{
 let jsonReads=0;await page.route('**/api/artwork-experiences/**',route=>{jsonReads++;return route.fulfill({status:503,contentType:'application/json',body:'{"error":{"code":"unexpected_read"}}'});});
 await page.goto(origin);await dismissNotice(page);
 const link=page.locator('[data-artwork-card] a').first();await expect(link).toBeVisible();
 await link.evaluate(node=>{Reflect.set(window,'openingOriginLink',node);});
 for(let visit=0;visit<2;visit++){
  const routeReads:string[]=[];const record=(request:import('@playwright/test').Request)=>{const url=new URL(request.url());if(url.pathname.includes('/artworks/')&&url.searchParams.has('_rsc'))routeReads.push(url.pathname);};page.on('request',record);
  await link.click();await expect(page.getByRole('dialog').getByTestId('artwork-experience')).toBeVisible();
  expect(routeReads.length).toBeLessThanOrEqual(1);if(visit===0)expect(routeReads).toHaveLength(1);expect(jsonReads).toBe(0);
  await page.getByRole('button',{name:'Fermer la fiche de l’œuvre',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page).toHaveURL(new RegExp(origin==='/'?'/$':'/artworks$'));
  await expect(link).toBeFocused();expect(await link.evaluate(node=>node===Reflect.get(window,'openingOriginLink'))).toBe(true);page.off('request',record);
 }
});

test('adopts a directly loaded document without a browser JSON validation',async({page})=>{
 let reads=0;await page.route('**/api/artwork-experiences/**',route=>{reads++;return route.abort();});
 await page.goto('/artworks/'+site().artworkId);await expect(page.getByRole('dialog').getByTestId('artwork-experience')).toBeVisible();expect(reads).toBe(0);
});

test('legacy UUID redirects retain the catalogue origin and focus',async({page})=>{
 await page.goto('/artworks?q=demonstration&page=2');await dismissNotice(page);
 await page.evaluate(id=>{const link=document.createElement('a');link.href='/artworks/'+id;link.textContent='Legacy artwork target';document.querySelector('main')!.append(link);},site().artworkId);
 const link=page.getByRole('link',{name:'Legacy artwork target',exact:true});await link.click();await expect(page.getByRole('dialog').getByTestId('artwork-experience')).toBeVisible();
 await page.getByRole('button',{name:'Fermer la fiche de l’œuvre',exact:true}).click();await expect(page).toHaveURL(/\/artworks\?q=demonstration&page=2$/);await expect(link).toBeFocused();
});

test('an unavailable target uses the route error and closes to its original page',async({page})=>{
 await page.goto('/');await dismissNotice(page);await page.evaluate(()=>{const link=document.createElement('a');link.href='/artworks/50000000-0000-4000-8000-000000000046';link.textContent='Unavailable artwork target';document.querySelector('main')!.append(link);});
 await page.getByRole('link',{name:'Unavailable artwork target',exact:true}).click();await expect(page.getByText('Cette œuvre n’est plus disponible.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Fermer la fiche de l’œuvre',exact:true}).click();await expect(page).toHaveURL(/\/$/);await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('Escape before the route completes returns once to the retained catalogue',async({page})=>{
 await page.goto('/artworks');await dismissNotice(page);const link=page.locator('[data-artwork-card] a').first();await expect(link).toBeVisible();
 let release!:()=>void,started!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;}),observed=new Promise<void>(resolve=>{started=resolve;});
 await page.route('**/artworks/**',async route=>{if(route.request().headers().rsc!=='1')return route.continue();started();await gate;await route.continue();});
 await link.click();await observed;await page.keyboard.press('Escape');release();
 await expect(page.locator('[data-artwork-return-phase]')).toHaveCount(0);await expect(page).toHaveURL(/\/artworks$/);await expect(page.getByRole('dialog')).toHaveCount(0);await expect(link).toBeFocused();
});

for(const close of ['button','back'] as const)test(`closing after a reload restores the mounted catalogue without header loading (${close})`,async({page})=>{
 await page.goto('/');await dismissNotice(page);await page.locator('header a[href="/artworks"]').first().click();await expect(page.locator('main')).toHaveAttribute('data-header-state','ready');
 expect(await page.evaluate(()=>Boolean(history.state?.__siteHeaderNavigation))).toBe(true);
 await page.reload();await expect(page.locator('main')).toHaveAttribute('data-header-state','ready');await dismissNotice(page);
 const link=page.locator('[data-artwork-card] a').first();await expect(link).toBeVisible();await link.evaluate(node=>Reflect.set(window,'reloadedOriginCard',node));
 for(let visit=0;visit<2;visit++){
  await link.click();await expect(page.getByRole('dialog').getByTestId('artwork-experience')).toBeVisible();
  const requests:string[]=[];const record=(r:import('@playwright/test').Request)=>{const url=new URL(r.url());if(r.isNavigationRequest()||url.searchParams.has('_rsc')||url.pathname==='/api/artwork-catalog')requests.push(url.pathname);};page.on('request',record);
  if(close==='back')await page.goBack();else await page.getByRole('button',{name:'Fermer la fiche de l’œuvre',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.locator('[data-artwork-return-phase]')).toHaveCount(0);
  await expect(page.locator('main')).toHaveAttribute('data-header-state','ready');await expect(page.locator('main')).toBeVisible();await expect(page.locator('[data-header-status]')).toHaveCount(0);
  expect(requests).toEqual([]);expect(await link.evaluate(node=>node===Reflect.get(window,'reloadedOriginCard'))).toBe(true);await expect(link).toBeFocused();page.off('request',record);
 }
});
