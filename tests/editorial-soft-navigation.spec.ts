import {test,expect} from '@playwright/test';
const custom=process.env.E2E_EDITORIAL_NAVIGATION_PATH;
test.skip(!custom&&!process.env.E2E_EDITORIAL_FIXTURE?.includes('/immersive'),'Requires published immersive articles.');
const paths=custom?[custom]:['/publications/etude-editoriale-1','/news/etude-editoriale-2'];
for(const path of paths)test(`opens and closes ${path} without replacing the document or header`,async({page,browserName},info)=>{
 test.setTimeout(90000);
 await page.setViewportSize(browserName==='webkit'?{width:390,height:844}:{width:1440,height:1000});
 // Navigation needs no image bytes; keep this acceptance check free of transformations.
 await page.addInitScript(()=>{window.addEventListener('artwork-origin-ready',()=>{Reflect.set(window,'editorialSourceReady',true);});});
 await page.route('**/*',route=>['image','media','font'].includes(route.request().resourceType())?route.abort():route.continue());
 const list=path.slice(0,path.lastIndexOf('/'));await page.goto(list);await page.waitForFunction(()=>Reflect.get(window,'editorialSourceReady'));const card=page.locator('main a').filter({has:page.locator('h2,h3')}).filter({visible:true});
 const link=page.locator('main a[href="'+path+'"]:visible').first();await expect(link).toBeVisible();
 // The original regression only happens when the source page has already scrolled.
 await link.evaluate(anchor=>{const spacer=document.createElement('div');spacer.style.height='2600px';anchor.closest('ul')!.before(spacer);});await link.scrollIntoViewIfNeeded();expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(1000);
 await page.evaluate(()=>{Object.assign(window,{editorialNavigationToken:crypto.randomUUID(),editorialNavigationHeader:document.querySelector('header')});});const token=await page.evaluate(()=>Reflect.get(window,'editorialNavigationToken')),documents:string[]=[];
 page.on('request',request=>{if(request.isNavigationRequest()&&request.frame()===page.mainFrame())documents.push(request.url());});
 await link.click();await expect(page).toHaveURL(new RegExp(path+'$'));await expect(page.locator('[data-editorial-immersive=true]:visible')).toBeVisible({timeout:15000});await expect(page.locator('main:visible')).toHaveAttribute('data-header-state','ready',{timeout:15000});
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);await expect(page.locator('footer:visible')).toHaveCount(0);
 const header=page.locator('[data-editorial-layout] > header:visible').first();expect((await header.boundingBox())!.y).toBeGreaterThanOrEqual(-1);
 expect(await page.evaluate(()=>Reflect.get(window,'editorialNavigationToken'))).toBe(token);expect(await page.evaluate(()=>document.querySelector('header')===Reflect.get(window,'editorialNavigationHeader'))).toBe(true);
 const reader=page.locator('[data-editorial-immersive=true]:visible'),active=reader.locator('[data-state=active]'),firstView=await active.getAttribute('data-editorial-view-id');
 await active.locator('[data-editorial-scroll-host]').first().evaluate(element=>{element.scrollTop=element.scrollHeight;});const box=(await active.boundingBox())!;await active.hover({position:{x:box.width*.4,y:box.height*.5}});await page.mouse.wheel(0,180);await expect(active).not.toHaveAttribute('data-editorial-view-id',firstView!);await expect(reader).toHaveAttribute('data-reader-state','ready');
 // Pause each veil fade to inspect both surfaces without slowing network.
 await page.locator('[data-editorial-exit-veil]').evaluate(node=>{const veil=node as HTMLElement,animate=veil.animate.bind(veil);veil.animate=(keyframes,options)=>{const motion=animate(keyframes,options);motion.pause();motion.currentTime=125;const frames=(motion.effect as KeyframeEffect).getKeyframes();Reflect.set(window,Number(frames.at(-1)?.opacity)===0?'editorialExitFadeOut':'editorialExitAnimation',motion);return motion;};});
 const exit=page.locator('[data-editorial-exit]:visible');await exit.click();await expect(exit).toHaveAttribute('aria-disabled','true');await expect(reader).toHaveAttribute('data-editorial-closing','true');await expect(reader).toBeVisible();await expect(page).toHaveURL(new RegExp(path+'$'));
 const veil=page.locator('[data-editorial-exit-veil]');expect(await veil.evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgba(255, 255, 255, 0.6)');expect(await veil.evaluate(el=>Number(getComputedStyle(el).opacity))).toBeGreaterThan(0);expect(await veil.evaluate(el=>Number(getComputedStyle(el).opacity))).toBeLessThan(1);
 const loading=page.locator('[data-header-status][role=progressbar]');await expect(loading).toBeVisible();await expect.poll(()=>loading.locator('[aria-hidden=true]').evaluate(el=>Number(getComputedStyle(el).opacity))).toBe(1);
 expect(await page.evaluate(()=>{const loader=document.querySelector<HTMLElement>('[data-header-status][role=progressbar]')!,veil=document.querySelector<HTMLElement>('[data-editorial-exit-veil]')!;loader.style.pointerEvents=veil.style.pointerEvents='auto';const box=loader.getBoundingClientRect(),hit=document.elementFromPoint(box.x+box.width/2,box.y+box.height/2),above=hit===loader||loader.contains(hit);loader.style.pointerEvents=veil.style.pointerEvents='';return above;})).toBe(true);
 await exit.dispatchEvent('click');await expect(page).toHaveURL(new RegExp(path+'$'));await page.screenshot({path:info.outputPath('immersive-exit-feedback.png')});
 await page.evaluate(()=>Reflect.get(window,'editorialExitAnimation').finish());await expect(page).toHaveURL(new RegExp(list+'$'));await expect(page.locator('main:visible')).toHaveAttribute('data-header-state','ready',{timeout:15000});await expect(page.locator('[data-editorial-immersive=true]:visible')).toHaveCount(0);
 // The persistent layer now fades over the destination instead of disappearing with the reader.
 await expect.poll(()=>veil.evaluate(el=>Number(getComputedStyle(el).opacity))).toBeGreaterThan(0);expect(await veil.evaluate(el=>Number(getComputedStyle(el).opacity))).toBeLessThan(1);await page.evaluate(()=>Reflect.get(window,'editorialExitFadeOut').finish());await expect(veil).toHaveCSS('opacity','0');
 expect(await page.evaluate(()=>Reflect.get(window,'editorialNavigationToken'))).toBe(token);expect(await page.evaluate(()=>document.querySelector('header')===Reflect.get(window,'editorialNavigationHeader'))).toBe(true);
 await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
 await page.goBack();await expect(page).toHaveURL(new RegExp(path+'$'));await expect(page.locator('[data-editorial-immersive=true]:visible')).toBeVisible({timeout:15000});await expect(page.locator('main:visible')).toHaveAttribute('data-header-state','ready',{timeout:15000});
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);await expect(page.locator('footer:visible')).toHaveCount(0);await expect(page.locator('[data-editorial-immersive=true]:visible [data-state=active]')).toHaveAttribute('data-editorial-view-id',firstView!);
 await page.goForward();await expect(page).toHaveURL(new RegExp(list+'$'));await expect(page.locator('main:visible')).toHaveAttribute('data-header-state','ready',{timeout:15000});
 expect(await page.evaluate(()=>Reflect.get(window,'editorialNavigationToken'))).toBe(token);expect(documents).toEqual([]);expect(await card.count()).toBeGreaterThan(0);
 // An explicit new click also starts at the opening, with no stale exit state.
 await page.locator('main a[href="'+path+'"]:visible').first().click();await expect(reader).toBeVisible({timeout:15000});await expect(page.locator('main:visible')).toHaveAttribute('data-header-state','ready',{timeout:15000});await expect(active).toHaveAttribute('data-editorial-view-id',firstView!);await expect(reader).not.toHaveAttribute('data-editorial-closing','true');await expect(page.locator('[data-editorial-exit]:visible')).not.toHaveAttribute('aria-disabled','true');expect(documents).toEqual([]);
});
