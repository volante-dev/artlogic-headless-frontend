import {test,expect} from "@playwright/test";
import {openRatton} from "./ratton-fixture";
test("mobile examination expands the existing carousel and restores reading",async({page},info)=>{
 await page.setViewportSize({width:390,height:844});const root=await openRatton(page,12),viewport=root.locator('[data-ratton-viewport]');
 await expect.poll(()=>root.evaluate(n=>getComputedStyle(n).opacity)).toBe('1');
 await page.screenshot({path:info.outputPath('mobile-reading.png')});
 await viewport.evaluate(n=>{n.scrollTop=80;});const origin=await viewport.evaluate(n=>n.scrollTop);
 await root.evaluate(host=>{
  const frames:object[]=[];Reflect.set(window,'rattonExpansionFrames',frames);
  host.addEventListener('click',()=>{const start=performance.now(),sample=()=>{
   const media=host.querySelector<HTMLElement>('[data-ratton-media]')!,control=host.querySelector<HTMLElement>('[data-ratton-current] [data-artwork-entry-controls]')!,timeline=host.querySelector<HTMLElement>('[data-ratton-timeline]')!;
   frames.push({time:performance.now()-start,height:media.getBoundingClientRect().height,reading:host.querySelector('[data-ratton-reading]')!.getBoundingClientRect().top,opacity:Number(getComputedStyle(control).opacity),label:control.getAttribute('aria-label'),timeline:Number(getComputedStyle(timeline).opacity),phase:host.getAttribute('data-ratton-expansion')});
   if(host.getAttribute('data-ratton-expansion')!=='expanded'&&performance.now()-start<3000)requestAnimationFrame(sample);
  };requestAnimationFrame(sample);},{once:true});
 });
 await root.getByRole('button',{name:'Plein écran',exact:true}).click();await expect(root).toHaveAttribute('data-ratton-expansion','expanded');
 const frames=await page.evaluate(()=>Reflect.get(window,'rattonExpansionFrames') as {time:number;height:number;reading:number;opacity:number;label:string;timeline:number;phase:string}[]);
 await info.attach('expansion-frames',{body:JSON.stringify(frames),contentType:'application/json'});
 const hidden=frames.find(f=>f.opacity<.02),growing=frames.find(f=>f.height>frames[0].height+2),returning=frames.find(f=>f.label==='Revenir à la taille normale'&&f.opacity>.02);
 expect(hidden).toBeTruthy();expect(growing!.time).toBeGreaterThanOrEqual(hidden!.time-34);expect(returning!.height).toBeGreaterThanOrEqual(842);expect(frames.some(f=>f.timeline>.1&&f.time<returning!.time)).toBe(true);expect(Math.max(...frames.map(f=>f.reading))-frames[0].reading).toBeGreaterThan(60);
 const geometry=await root.locator('[data-ratton-media]').evaluate(n=>({top:n.getBoundingClientRect().top,height:n.getBoundingClientRect().height,viewport:innerHeight}));expect(Math.abs(geometry.top)).toBeLessThan(2);expect(Math.abs(geometry.height-geometry.viewport)).toBeLessThan(2);
 await page.screenshot({path:info.outputPath('mobile-expanded.png')});
 await expect(root.locator('[data-ratton-timeline]')).toBeVisible();await expect(root.locator('[data-ratton-timeline] button')).toHaveCount(12);
 const line=await root.locator('[data-ratton-timeline]').evaluate(n=>n.scrollWidth<=n.clientWidth+1);expect(line).toBe(true);
 await root.getByRole('button',{name:'Vue suivante',exact:true}).click();await expect(root.locator('[data-ratton-counter]')).toHaveText('2 / 12');expect(await root.locator('[data-ratton-photo]').count()).toBeLessThanOrEqual(3);
 await root.getByRole('button',{name:'Revenir à la taille normale',exact:true}).click();await expect(root).toHaveAttribute('data-ratton-expansion','collapsed');await expect(root.locator('[data-ratton-counter]')).toHaveText('2 / 12');expect(await viewport.evaluate(n=>n.scrollTop)).toBeCloseTo(origin,0);
 expect(await page.evaluate(()=>scrollY)).toBe(0);
});
test("Escape, revalidation, resize and reduced motion preserve a usable examination",async({page},info)=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});const root=await openRatton(page,2);await root.getByRole('button',{name:'Plein écran',exact:true}).click();await expect(root).toHaveAttribute('data-ratton-expansion','expanded');
 const response=page.waitForResponse(r=>r.url().includes('/api/artwork-experiences/')&&r.ok());await page.evaluate(()=>window.dispatchEvent(new Event('artwork-revalidate')));await response;await expect(root).toHaveAttribute('data-ratton-expansion','expanded');
 await page.keyboard.press('Escape');await expect(root).toHaveAttribute('data-ratton-expansion','collapsed');await expect(page.getByRole('dialog')).toHaveCount(1);
 await root.getByRole('button',{name:'Plein écran',exact:true}).click();await expect(root).toHaveAttribute('data-ratton-expansion','expanded');await page.setViewportSize({width:844,height:390});await expect.poll(()=>root.locator('[data-ratton-media]').evaluate(n=>Math.round(n.getBoundingClientRect().height))).toBe(390);
 await page.setViewportSize({width:1440,height:900});await expect(root).not.toHaveAttribute('data-ratton-expansion','expanded');await expect(root.getByRole('button',{name:'Agrandir l’image ×2',exact:true})).toBeVisible();await page.screenshot({path:info.outputPath('desktop-reading.png')});
});
test("Escape can interrupt opening and a single photo can be expanded again",async({page})=>{
 await page.setViewportSize({width:390,height:844});const root=await openRatton(page,1);
 await root.getByRole('button',{name:'Plein écran',exact:true}).click();
 await expect(root).toHaveAttribute('data-ratton-expansion','opening');await page.keyboard.press('Escape');
 await expect(root).toHaveAttribute('data-ratton-expansion','collapsed');await expect(page.getByRole('dialog')).toHaveCount(1);
 await root.getByRole('button',{name:'Plein écran',exact:true}).click();await expect(root).toHaveAttribute('data-ratton-expansion','expanded');
 await expect(root.getByRole('button',{name:'Vue suivante',exact:true})).toHaveCount(0);await expect(root.locator('[data-ratton-timeline]')).toBeVisible();
 await page.getByRole('button',{name:'Fermer la fiche de l’œuvre',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
});
