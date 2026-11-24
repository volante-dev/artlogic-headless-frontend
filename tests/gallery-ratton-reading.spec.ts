import {test,expect} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import {openRatton,rattonSites,rattonWork} from "./ratton-fixture";

test("retains native reading and selection through a completed revalidation",async({page})=>{
 const root=await openRatton(page,12);
 const scroll=await root.evaluate(n=>{const viewport=n.querySelector<HTMLElement>('[data-ratton-viewport]')!,reading=n.querySelector<HTMLElement>('[data-ratton-reading]')!,element=viewport.clientHeight?viewport:reading;element.scrollTop=200;return element.scrollTop;});
 expect(scroll).toBeGreaterThan(0);
 await root.getByRole("button",{name:"Vue suivante",exact:true}).click();
 const response=page.waitForResponse(r=>r.url().includes('/api/artwork-experiences/')&&r.ok());
 await page.evaluate(()=>window.dispatchEvent(new Event('artwork-revalidate')));await response;
 await expect(root.locator('[data-ratton-counter]')).toHaveText('2 / 12');
 await expect.poll(()=>root.evaluate(n=>{const viewport=n.querySelector<HTMLElement>('[data-ratton-viewport]')!;return (viewport.clientHeight?viewport:n.querySelector<HTMLElement>('[data-ratton-reading]')!).scrollTop;})).toBe(scroll);
 expect(await page.evaluate(()=>window.scrollY)).toBe(0);
});

test("a failed neighbor stays local and can be retried without losing information",async({page,request})=>{
 const site=rattonSites()[0]!,data=await(await request.get(site.siteOrigin+'/api/artwork-experiences/'+rattonWork(2))).json(),id=data.artwork.media[1].id as string;
 const pattern='**/*'+id+'*';await page.route(pattern,route=>route.request().resourceType()==='image'?route.fulfill({status:503,body:''}):route.continue());
 const root=await openRatton(page,2);await root.getByRole('button',{name:'Vue suivante',exact:true}).click();
 await expect(root.locator('[data-ratton-current]').getByRole('button',{name:'Réessayer',exact:true})).toBeVisible();
 await expect(root.locator('h1')).toBeVisible();await expect(root.locator('a[href*="/contact?artwork="]')).toBeVisible();
 await page.unroute(pattern);await root.locator('[data-ratton-current]').getByRole('button',{name:'Réessayer',exact:true}).click();
 await expect(root.locator('[data-ratton-current] img')).toBeVisible();
 await expect.poll(()=>root.locator('[data-ratton-current] img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
});

test("horizontal photo gestures do not turn vertical reading into scene navigation",async({page})=>{
 const root=await openRatton(page,2),photos=root.locator('[data-ratton-carousel]>div').first();
 for(const [type,x,y]of [['pointerdown',160,120],['pointermove',70,124],['pointerup',70,124]] as const)await photos.dispatchEvent(type,{pointerId:1,isPrimary:true,pointerType:'touch',button:0,clientX:x,clientY:y});
 await expect(root.locator('[data-ratton-counter]')).toHaveText('2 / 2');
 for(const [type,x,y]of [['pointerdown',160,120],['pointermove',150,210],['pointerup',150,210]] as const)await photos.dispatchEvent(type,{pointerId:2,isPrimary:true,pointerType:'touch',button:0,clientX:x,clientY:y});
 await expect(root.locator('[data-ratton-counter]')).toHaveText('2 / 2');
 expect(await page.getByRole('dialog').evaluate(n=>n.scrollHeight<=n.clientHeight+1)).toBe(true);
});

test("composition matrix and optional visual evidence",async({page})=>{
 for(const [width,height,name]of [[1440,900,'desktop'],[390,844,'mobile'],[360,800,'mobile-360'],[844,390,'landscape'],[720,450,'zoom-200']] as const){
  await page.setViewportSize({width,height});const root=await openRatton(page,2);await page.evaluate(()=>document.fonts.ready);
  await expect(root.locator('[data-ratton-current]')).toHaveAttribute('data-ratton-decoded','true');
  const positions=await root.evaluate(n=>({overflow:n.scrollWidth>n.clientWidth+1,title:n.querySelector('h1')!.getBoundingClientRect().bottom,photo:n.querySelector('[data-ratton-current]')!.getBoundingClientRect().bottom,height:innerHeight}));
  expect(positions.overflow).toBe(false);expect(positions.title).toBeLessThanOrEqual(positions.height);expect(positions.photo).toBeLessThanOrEqual(positions.height);
  if(process.env.E2E_GALLERY_CAPTURE==='1'){await mkdir('.impeccable/review',{recursive:true});await page.screenshot({path:'.impeccable/review/ratton-'+name+'.png',fullPage:true});}
 }
});
