import {test,expect} from '@playwright/test';
const custom=process.env.E2E_EDITORIAL_NAVIGATION_PATH;
test.skip(!custom&&!process.env.E2E_EDITORIAL_FIXTURE?.includes('/immersive'),'Requires published immersive articles.');
const paths=custom?[custom]:['/publications/etude-editoriale-1','/news/etude-editoriale-2'];
for(const path of paths)test(`opens and closes ${path} without replacing the document or header`,async({page,browserName})=>{
 await page.setViewportSize(browserName==='webkit'?{width:390,height:844}:{width:1440,height:1000});
 // Navigation needs no image bytes; keep this acceptance check free of transformations.
 await page.route('**/*',route=>['image','media','font'].includes(route.request().resourceType())?route.abort():route.continue());
 const list=path.slice(0,path.lastIndexOf('/'));await page.goto(list);const card=page.locator('main a').filter({has:page.locator('h2,h3')}).filter({visible:true}).filter({hasNot:page.locator('[data-image-fallback]')});
 const link=page.locator('main a[href="'+path+'"]:visible').first();await expect(link).toBeVisible();
 await page.evaluate(()=>{Object.assign(window,{editorialNavigationToken:crypto.randomUUID(),editorialNavigationHeader:document.querySelector('header')});});const token=await page.evaluate(()=>Reflect.get(window,'editorialNavigationToken')),documents:string[]=[];
 page.on('request',request=>{if(request.isNavigationRequest()&&request.frame()===page.mainFrame())documents.push(request.url());});
 await link.click();await expect(page).toHaveURL(new RegExp(path+'$'));await expect(page.locator('[data-editorial-immersive=true]:visible')).toBeVisible();
 expect(await page.evaluate(()=>Reflect.get(window,'editorialNavigationToken'))).toBe(token);expect(await page.evaluate(()=>document.querySelector('header')===Reflect.get(window,'editorialNavigationHeader'))).toBe(true);
 await page.locator('[data-editorial-exit]:visible').click();await expect(page).toHaveURL(new RegExp(list+'$'));await expect(page.locator('main:visible')).toBeVisible();await expect(page.locator('[data-editorial-immersive=true]:visible')).toHaveCount(0);
 expect(await page.evaluate(()=>Reflect.get(window,'editorialNavigationToken'))).toBe(token);expect(await page.evaluate(()=>document.querySelector('header')===Reflect.get(window,'editorialNavigationHeader'))).toBe(true);
 await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
 await page.goBack();await expect(page).toHaveURL(new RegExp(path+'$'));await expect(page.locator('[data-editorial-immersive=true]:visible')).toBeVisible();
 await page.goForward();await expect(page).toHaveURL(new RegExp(list+'$'));await expect(page.locator('main:visible')).toBeVisible();
 expect(await page.evaluate(()=>Reflect.get(window,'editorialNavigationToken'))).toBe(token);expect(documents).toEqual([]);expect(await card.count()).toBeGreaterThan(0);
});
