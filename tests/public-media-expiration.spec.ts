import {writeFile} from "node:fs/promises";
import {test,expect} from "@playwright/test";
test.use({trace:"off",screenshot:"off",video:"off"});
test("a transfer failure retries once while keeping the page usable",async({page})=>{
 let failures=0;await page.route('**/media/*',async route=>{failures++;await route.fulfill({status:503,body:''});});
 await page.goto('/artworks');await expect(page.getByRole('main')).toBeVisible();
 await expect.poll(()=>failures).toBeGreaterThan(0);await page.waitForTimeout(500);
 const count=failures;await page.waitForTimeout(500);expect(failures).toBe(count);
 await expect(page.getByRole('heading',{name:'Présentation indisponible'})).toHaveCount(0);
});
test("late images resolve from stable references during an extended visit",async({page})=>{
 test.setTimeout(process.env.E2E_LONG_VISIT==='true'?960000:60000);
 await page.clock.install();await page.goto('/artworks');await page.evaluate(()=>{(window as unknown as {media025Document:string}).media025Document='retained';});const first=page.getByTestId('artwork-image').first();await expect.poll(()=>first.evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);
 const initial=await first.getAttribute('src');
 const visitStart=Date.now();if(process.env.E2E_LONG_VISIT==='true')await page.waitForTimeout(900000);else await page.clock.fastForward(31000);
 await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));const last=page.getByTestId('artwork-image').last();await expect.poll(()=>last.evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);
 await expect(page.getByRole('main')).toBeVisible();expect(new URL(initial!,page.url()).pathname).toMatch(/^\/media\//);
 const card=page.locator('[data-artwork-card] a').last();await card.scrollIntoViewIfNeeded();await card.click();const detail=page.locator('[data-artwork-experience] img').first();await expect(detail).toBeVisible();await expect.poll(()=>detail.evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);expect(await page.evaluate(()=>(window as unknown as {media025Document:string}).media025Document)).toBe('retained');
 if(process.env.E2E_LONG_VISIT==='true')await writeFile(new URL('../../backend/specs/025-direct-media-delivery/long-visit.md',import.meta.url),'# Visite longue — 025\n\n'+JSON.stringify({gate:'G-N',part:'long-visit',status:'PASS',elapsedMs:Date.now()-visitStart,browser: test.info().project.name,fullPageReload:false,secretsIncluded:false})+'\n');
});
test("explicit retry creates a new bounded attempt without losing the selected artwork",async({page})=>{
 const {fixture}=await import('./helpers');await page.route('**/media/*',route=>route.fulfill({status:503,body:''}));await page.goto('/artworks/'+fixture().published[0]!.id);
 await expect(page.getByText('Image non disponible',{exact:true}).first()).toBeVisible();const href=page.url();
 await page.unroute('**/media/*');await page.getByRole('button',{name:'Réessayer',exact:true}).first().click();
 const image=page.getByTestId('artwork-image').first();await expect.poll(()=>image.evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);expect(page.url()).toBe(href);expect(await image.getAttribute('src')).toContain('.manual1');
});
