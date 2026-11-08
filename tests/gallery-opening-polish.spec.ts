import {test,expect} from '@playwright/test';
import {readFileSync,mkdirSync} from 'node:fs';
for(const width of [390,1440])test(`opening control choreography and right alignment at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 await page.addInitScript(()=>{const samples:unknown[]=[];Object.assign(window,{openingPolishSamples:samples});new MutationObserver(()=>{const root=document.querySelector('[data-artwork-experience]'),row=document.querySelector('[data-artwork-dialog-controls]'),frost=root?.querySelector('[data-artwork-frost-content]'),media=root?.querySelector('[data-artwork-entry-media]');if(!root||!row)return;const details=(node:Element|null|undefined)=>node?.getAnimations().map(a=>({start:Number(a.startTime)+Number(a.effect!.getTiming().delay),duration:a.effect!.getTiming().duration,frames:(a.effect as KeyframeEffect).getKeyframes().map(k=>({opacity:k.opacity,filter:k.filter,transform:k.transform}))}));samples.push({phase:root.getAttribute('data-artwork-opening-phase'),controls:details(row),identity:details(frost),media:details(media)});}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-artwork-opening-phase']});});
 const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0];await page.goto('/artworks/'+site.artworkId);
 const scene=page.getByTestId('artwork-experience');await expect(scene).toHaveAttribute('data-artwork-opening-phase','complete');
 type AnimationSample={start:number;duration:number;frames:{opacity?:string;filter?:string;transform?:string}[]};
 const samples=await page.evaluate(()=>Reflect.get(window,'openingPolishSamples')) as {controls?:AnimationSample[];media?:AnimationSample[];identity?:AnimationSample[]}[];
 const sample=samples.find(s=>s.controls?.[0]&&s.media?.[0]);expect(sample).toBeTruthy();expect(sample!.controls![0].start).toBeGreaterThanOrEqual(sample!.media![0].start+sample!.media![0].duration-2);expect(sample!.controls![0].duration).toBe(360);expect(sample!.controls![0].frames[0]).toMatchObject({opacity:'0',filter:'blur(6px)',transform:'translateY(-12px)'});
 const identity=samples.find(s=>s.identity?.[0]);expect(identity!.identity![0].duration).toBe(600);expect(identity!.identity![0].frames[0].filter).toBe('blur(6px)');
 const close=page.getByRole('button',{name:'Fermer la fiche de l’œuvre',exact:true});
 const actualZoom=scene.getByRole('button',{name:/^Agrandir l’image(?: ×2)?$/}).first();
 const right=await close.boundingBox(),z=await actualZoom.boundingBox();expect(right).toBeTruthy();expect(z).toBeTruthy();expect(z!.x+z!.width).toBeCloseTo(right!.x+right!.width,0);
 expect(await close.evaluate(n=>getComputedStyle(n).boxShadow)).toBe('none');expect(await actualZoom.evaluate(n=>getComputedStyle(n).boxShadow)).toBe('none');expect(await actualZoom.evaluate(n=>getComputedStyle(n).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
 const style=await close.evaluate(n=>getComputedStyle(n).transitionProperty);expect(style).toContain('background-color');
 const frost=scene.locator('[data-artwork-frost]');expect(await frost.evaluate(n=>getComputedStyle(n).borderRadius)).toBe('0px');
 mkdirSync('.impeccable/review',{recursive:true});await page.screenshot({path:`.impeccable/review/artwork-opening-polish-${width}.png`});
 if(width>=768){
  // The information slide keeps the hero media mounted: its zoom must still become a light control.
  await page.mouse.move(1000,500);await page.mouse.wheel(0,600);
  await expect(scene).toHaveAttribute('data-rail-tone','paper');await expect(scene).toHaveAttribute('data-scroll-motion','idle');
  const heroZoom=scene.locator('[data-view="0"] button');
  await expect.poll(()=>heroZoom.evaluate(n=>getComputedStyle(n).backgroundColor)).toBe(await scene.evaluate(n=>getComputedStyle(n).backgroundColor));
  expect(await heroZoom.evaluate(n=>getComputedStyle(n).boxShadow)).not.toBe('none');
  expect(await heroZoom.locator('svg').evaluate(n=>getComputedStyle(n).filter)).toBe('none');
  const frame=scene.getByTestId('artwork-frame'),before=(await frame.boundingBox())!,offset=before.x+before.width-z!.x-z!.width;await scene.getByRole('navigation',{name:'Vues de l’œuvre',exact:true}).getByRole('button').nth(1).click();await expect(scene).toHaveAttribute('data-scroll-motion','idle');await expect.poll(()=>close.evaluate(n=>getComputedStyle(n).boxShadow)).not.toBe('none');const after=(await frame.boundingBox())!,next=(await scene.locator('[data-view="1"] button').boundingBox())!;expect(after.x+after.width-next.x-next.width).toBeCloseTo(offset,0);}
});
