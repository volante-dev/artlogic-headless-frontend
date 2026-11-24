import {test,expect,type Page} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";
import {rattonSites,rattonWork} from "./ratton-fixture";

async function ready(page:Page){return page.evaluate(async()=>{
 const start=performance.now();
 return new Promise<number>((resolve,reject)=>{const frame=()=>{const root=document.querySelector<HTMLElement>('[data-artwork-experience]'),title=root?.querySelector('[data-artwork-frost-content]>p:first-child')??root?.querySelector('h1'),img=root?.querySelector<HTMLImageElement>('[data-ratton-current] img')??root?.querySelector<HTMLImageElement>('img');
  if(performance.now()-start>15000){reject(new Error('first_view_not_ready'));return;}
  const visible=(node:Element,photo=false)=>{const box=node.getBoundingClientRect();if(box.width<=0||box.height<=0||(photo?(box.bottom<=0||box.top>=innerHeight||box.right<=0||box.left>=innerWidth):(box.bottom>innerHeight+1||box.top<0)))return false;for(let p:Element|null=node;p;p=p.parentElement){const style=getComputedStyle(p);if(style.visibility==='hidden'||Number(style.opacity)<.999)return false;}return true;};
  if(root&&title&&img&&img.complete&&img.naturalWidth&&root.dataset.artworkOpeningPhase==='complete'&&visible(title)&&visible(img,true)){void img.decode().then(()=>requestAnimationFrame(()=>resolve(performance.now())),reject);return;}requestAnimationFrame(frame);
 };requestAnimationFrame(frame);});
 });}

test("qualification: production first view cold and warm, direct and internal",async({browser})=>{
 test.skip(!['1','smoke'].includes(process.env.E2E_RATTON_MEASURE??''),'Explicit local production qualification only');test.setTimeout(900000);
 const sampleCount=process.env.E2E_RATTON_MEASURE==='smoke'?2:40,site=rattonSites()[0]!,results:Record<string,number[]>={},failures:string[]=[];
 campaign: for(const entry of ['direct','internal'] as const)for(const cache of ['cold','warm'] as const){const samples:number[]=[];results[entry+'-'+cache]=samples;
  for(let i=0;i<sampleCount;i++){const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();try{
   await page.addInitScript(()=>{document.addEventListener('click',event=>{if(event.target instanceof Element&&event.target.closest('#measure-artwork'))Reflect.set(window,'rattonActivation',performance.now());},true);});
   // Establish the necessary-storage information choice identically in both modes.
   await page.goto(site.siteOrigin+'/artworks?q=recette-aucune-cible',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Compris',exact:true}).click();
   const url=site.siteOrigin+'/artworks/'+rattonWork(1);
   if(cache==='warm'){await page.goto(url,{waitUntil:'domcontentloaded'});await ready(page);}
   if(entry==='direct'){await page.goto(url,{waitUntil:'domcontentloaded'});samples.push(await ready(page));}
   else{await page.goto(site.siteOrigin+'/artworks?q=recette-aucune-cible',{waitUntil:'networkidle'});await page.evaluate(id=>{const a=document.createElement('a');a.href='/artworks/'+id;a.id='measure-artwork';a.textContent='Œuvre de recette';document.querySelector('main')!.prepend(a);},rattonWork(1));await page.locator('#measure-artwork').click();const end=await ready(page),start=await page.evaluate(()=>Reflect.get(window,'rattonActivation') as number);expect(Number.isFinite(start)).toBe(true);expect(end).toBeGreaterThan(start);samples.push(end-start);}
  }catch(error){failures.push(`${entry}/${cache}/${i}: ${String(error)}`);break campaign;}finally{await context.close();}if((i+1)%10===0)console.log(JSON.stringify({mode:site.artworkView,entry,cache,n:samples.length}));}
 }
 const summary=Object.fromEntries(Object.entries(results).map(([key,values])=>[key,{n:values.length,p95:[...values].sort((a,b)=>a-b)[Math.ceil(.95*values.length)-1]}]));await mkdir('.runtime',{recursive:true});await writeFile('.runtime/ratton-performance-'+site.artworkView+(sampleCount<40?'-smoke':'')+'.json',JSON.stringify({mode:site.artworkView,viewport:[1440,900],network:'loopback unthrottled',results,summary,failures},null,2));expect(failures).toEqual([]);for(const values of Object.values(results))expect(values).toHaveLength(sampleCount);
});

test("qualification: exact decoded neighbors become visible within the frame budget",async({page})=>{
 test.skip(!['1','smoke'].includes(process.env.E2E_RATTON_MEASURE??'')||rattonSites()[0]!.artworkView!=='lucas-ratton','Ratton local production qualification only');test.setTimeout(120000);
 const site=rattonSites()[0]!;await page.goto(site.siteOrigin+'/artworks?q=recette-aucune-cible');await page.getByRole('button',{name:'Compris',exact:true}).click();
 const payload=await(await page.request.get(site.siteOrigin+'/api/artwork-experiences/'+rattonWork(12))).json(),mediaIds=(payload.artwork.media as {id:string}[]).map(m=>m.id),requested=new Set<string>();
 page.on('request',request=>{if(request.resourceType()==='image')for(const id of mediaIds)if(request.url().includes(id))requested.add(id);});
 await page.goto(site.siteOrigin+'/artworks/'+rattonWork(12));await ready(page);
 const initial=await page.locator('[data-ratton-photo]').count();expect(initial).toBe(2);
 await expect(page.locator('[data-ratton-photo]').nth(1)).toHaveAttribute('data-ratton-decoded','true');
 expect([...requested].sort()).toEqual(mediaIds.slice(0,2).sort());const initiallyRequested=[...requested];
 const samples:number[]=[],failures:string[]=[];let unprepared=0;
 for(let i=0;i<40;i++){
  const delta=i%2===0?1:-1,frames=page.locator('[data-ratton-photo]'),target=delta===1?frames.nth(1):frames.first();
  await expect(target).toHaveAttribute('data-ratton-decoded','true');const id=await target.getAttribute('data-ratton-photo');
  try{const measured=await page.evaluate(async({id,delta})=>{
   const node=document.querySelector<HTMLElement>(`[data-ratton-photo="${id}"]`)!,img=node.querySelector<HTMLImageElement>('img')!,source=img.currentSrc;
   if(!img.complete||!img.naturalWidth||node.dataset.rattonDecoded!=='true')return null;await img.decode();if(img.currentSrc!==source)return null;
   const buttons=document.querySelectorAll<HTMLButtonElement>('[data-ratton-navigation] button'),start=performance.now();buttons[delta===1?1:0]!.click();
   return new Promise<number>((resolve,reject)=>{const tick=()=>{if(performance.now()-start>2000){reject(new Error('neighbor_transition_timeout'));return;}const current=document.querySelector<HTMLElement>('[data-ratton-current]'),visible=current?.querySelector<HTMLImageElement>('img');if(current===node&&visible===img&&visible.currentSrc===source&&getComputedStyle(node).opacity==='1'&&!node.getAnimations().some(a=>a.playState==='running'))requestAnimationFrame(()=>resolve(performance.now()-start));else requestAnimationFrame(tick);};requestAnimationFrame(tick);});
  },{id,delta});if(measured===null)unprepared++;else samples.push(measured);expect(await frames.count()).toBeLessThanOrEqual(3);}catch(error){failures.push(String(error));}
 }
 await writeFile('.runtime/ratton-neighbors.json',JSON.stringify({initial,initiallyRequested,totalRequested:requested.size,prepared:samples.length,unprepared,samples,p95:[...samples].sort((a,b)=>a-b)[Math.ceil(.95*samples.length)-1],under150:samples.filter(n=>n<150).length,failures},null,2));expect(failures).toEqual([]);expect(samples).toHaveLength(40);expect(requested.size).toBeLessThanOrEqual(3);expect(samples.filter(n=>n<150).length/samples.length).toBeGreaterThanOrEqual(.95);
});
