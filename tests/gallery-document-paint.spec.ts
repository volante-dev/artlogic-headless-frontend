import {test,expect} from '@playwright/test';import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';import {resolve} from 'node:path';
test('normal first paints never reveal the native reader or a duplicate artwork heading',async({page},info)=>{
 if(!info.project.name.startsWith('mobile-'))await page.setViewportSize({width:1440,height:900});
 const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0];
 await page.addInitScript(()=>{const frames:{reader:boolean;headings:number}[]=[];Reflect.set(window,'documentPaintFrames',frames);const frame=()=>{const readers=[...document.querySelectorAll<HTMLElement>('[data-artwork-readable]')],dialog=document.querySelector('[role=dialog]');frames.push({reader:readers.some(n=>getComputedStyle(n).visibility==='visible'&&n.getBoundingClientRect().height>0),headings:dialog?.querySelectorAll('h1').length??0});if(frames.length<600)requestAnimationFrame(frame);};requestAnimationFrame(frame);});
 await page.goto('/artworks/'+site.finaleArtworkIds[3],{waitUntil:'domcontentloaded'});const root=page.getByTestId('artwork-experience');await expect(root).toHaveAttribute('data-artwork-opening-phase','complete');await page.waitForTimeout(80);
 const frames=await page.evaluate(()=>Reflect.get(window,'documentPaintFrames') as {reader:boolean;headings:number}[]);expect(frames.length).toBeGreaterThan(2);expect(frames.every(f=>!f.reader&&f.headings<=1)).toBe(true);
 const stage=process.env.E2E_DOCUMENT_MEASURE_STAGE??'after',dir=resolve('../backend/.runtime/document028');mkdirSync(dir,{recursive:true});writeFileSync(resolve(dir,stage+'-paint-'+info.project.name+'.json'),JSON.stringify(frames));await page.screenshot({path:resolve(dir,stage+'-opening-'+info.project.name+'.png')});
 await root.getByRole('button',{name:'Conclusion',exact:true}).click();await page.waitForTimeout(1800);await page.screenshot({path:resolve(dir,stage+'-summary-'+info.project.name+'.png')});
});
