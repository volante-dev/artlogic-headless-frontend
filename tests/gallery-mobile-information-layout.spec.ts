import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {openMobile} from './gallery-mobile-helpers';
test('measured axes, landscape reader, enlarged text and real profile composition',async({page},info)=>{
 const folder='.runtime/information024-review';mkdirSync(folder,{recursive:true});
 const results=[];
 for(const width of [320,390,430]){
  await page.setViewportSize({width,height:844});const scene=await openMobile(page),panel=scene.locator('[data-mobile-information-panel]');
  if(info.project.name==='mobile-chromium')await page.screenshot({path:`${folder}/${width}-closed.png`});
  await panel.evaluate(n=>{const samples:{time:number;width:number;height:number;top:number}[]=[];const started=performance.now();(window as unknown as {informationSamples:typeof samples}).informationSamples=samples;const tick=()=>{const top=n.querySelector<HTMLElement>('[data-information-border="top"]')!.getBoundingClientRect(),side=n.querySelector<HTMLElement>('[data-information-border="left"]')!.getBoundingClientRect();samples.push({time:performance.now()-started,width:top.width,height:side.height,top:top.top});if(performance.now()-started<2200)requestAnimationFrame(tick);};requestAnimationFrame(tick);});
  await scene.getByRole('button',{name:'Voir les informations',exact:true}).click();await expect(panel).toHaveAttribute('data-information-ready','true');
  const samples=await page.evaluate(()=>(window as unknown as {informationSamples:{time:number;width:number;height:number;top:number}[]}).informationSamples),first=samples[0]!,last=samples.at(-1)!;
  const horizontal=samples.filter(s=>Math.abs(s.height-first.height)<1&&s.width>last.width-1);expect(horizontal.length).toBeGreaterThan(0);expect(last.top).toBeCloseTo(24,0);
  const reader=scene.locator('[data-information-body]');expect(await reader.evaluate(n=>n.clientHeight)).toBeGreaterThanOrEqual(await reader.evaluate(n=>parseFloat(getComputedStyle(n).lineHeight)*2));
  results.push({width,first,last,horizontalFrames:horizontal.length});
  if(info.project.name==='mobile-chromium')await page.screenshot({path:`${folder}/${width}-open.png`});
 }
 await page.setViewportSize({width:844,height:390});const scene=await openMobile(page);
 await scene.evaluate(n=>{const root=n as HTMLElement;const body=root.querySelector<HTMLElement>('[data-information-body]')!;const toggle=root.querySelector<HTMLElement>('[data-mobile-trigger=information]')!;root.style.setProperty('--site-body-fontSize',2*parseFloat(getComputedStyle(body).fontSize)+'px');root.style.setProperty('--site-caption-fontSize',2*parseFloat(getComputedStyle(toggle).fontSize)+'px');for(const selector of ['[data-artwork-title]','[data-artwork-artist]']){const node=n.querySelector<HTMLElement>(selector);if(node)node.style.fontSize=2*parseFloat(getComputedStyle(node).fontSize)+'px';}});
 await scene.getByRole('button',{name:'Voir les informations',exact:true}).click();const panel=scene.locator('[data-mobile-information-panel]');await expect(panel).toHaveAttribute('data-information-ready','true');
 const layout=await panel.evaluate(n=>{const reader=n.querySelector<HTMLElement>('[data-mobile-information-scroll]')!,body=n.querySelector<HTMLElement>('[data-information-body]')!,button=n.querySelector<HTMLElement>('button')!;return {compact:n.getAttribute('data-information-compact'),height:reader.clientHeight,min:2*parseFloat(getComputedStyle(body).lineHeight),button:button.getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth>innerWidth};});
 expect(layout.compact).toBe('true');expect(layout.height).toBeGreaterThanOrEqual(layout.min);expect(layout.button).toBeLessThanOrEqual(390);expect(layout.overflow).toBe(false);
 if(info.project.name==='mobile-chromium')await page.screenshot({path:`${folder}/landscape-200-open.png`});
 const sites=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites;
 if(sites[1]){await page.setViewportSize({width:390,height:844});await page.goto(sites[1].siteOrigin+'/artworks/'+sites[1].mobileArtworkId);await expect(page.getByTestId('artwork-experience')).toHaveAttribute('data-artwork-opening-phase','complete');await page.locator('[data-mobile-trigger="information"]').click();await expect(page.locator('[data-mobile-information-panel]')).toHaveAttribute('data-information-ready','true');await expect(page.locator('[data-information-contact] a')).toHaveCount(1);}
 writeFileSync(`${folder}/${info.project.name}-geometry.json`,JSON.stringify({results,layout},null,2));
});
