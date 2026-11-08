import {test,expect} from "@playwright/test";
import {writeFile} from "node:fs/promises";
test.use({trace:"off",screenshot:"off",video:"off"});
test("measures 120 initially visible images at the specified network profile",async({browser,browserName,baseURL})=>{
 test.skip(process.env.E2E_PERFORMANCE!=="true"||browserName!=="chromium");test.setTimeout(300000);
 const transferBytes:number[]=[];const samples:number[]=[],authorizationMs:number[]=[],pageMs:number[]=[];let failed=0,invalidTiming=0;
 for(let visit=0;visit<30;visit++){
  const context=await browser.newContext({baseURL,viewport:{width:1440,height:1100}}),page=await context.newPage(),cdp=await context.newCDPSession(page);
  await cdp.send('Performance.enable',{timeDomain:'timeTicks'});await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:80,downloadThroughput:1250000,uploadThroughput:1250000});
  page.on('response',r=>{if(new URL(r.url()).pathname.startsWith('/storage/v1/object/sign/')){const size=Number(r.headers()['content-length']);if(Number.isFinite(size))transferBytes.push(size);}});
  const available=new Map<string,number>();
  cdp.on('Network.requestWillBeSent',event=>{const response=event.redirectResponse;if(response?.status!==307)return;const url=new URL(response.url);if(!url.pathname.startsWith('/media/'))return;available.set(url.pathname,event.timestamp*1000);if(response.timing)authorizationMs.push((event.timestamp-response.timing.requestTime)*1000);});
  await page.addInitScript(()=>{(window as unknown as {media025Loads:Record<string,number>}).media025Loads={};document.addEventListener('load',event=>{const el=event.target;if(el instanceof HTMLImageElement&&el.dataset.testid==='artwork-image')(window as unknown as {media025Loads:Record<string,number>}).media025Loads[new URL(el.src,location.href).pathname]=performance.now();},true);});
  const start=Date.now();await page.goto('/artworks');const images=page.getByTestId('artwork-image');await expect(images.first()).toBeVisible();
  const selected=await images.evaluateAll(elements=>elements.slice(0,4).map(e=>({path:new URL((e as HTMLImageElement).src).pathname,visible:e.getBoundingClientRect().top<innerHeight&&e.getBoundingClientRect().bottom>0})));
  expect(selected).toHaveLength(4);expect(selected.every(s=>s.visible)).toBe(true);
  try{await expect.poll(()=>images.evaluateAll(elements=>elements.slice(0,4).every(e=>(e as HTMLImageElement).complete&&(e as HTMLImageElement).naturalWidth>0)),{timeout:15000}).toBe(true);}catch{/* failures remain in the denominator */}
  const loaded=await page.evaluate(()=>(window as unknown as {media025Loads:Record<string,number>}).media025Loads);
  const metrics=await cdp.send('Performance.getMetrics'),navigationStart=metrics.metrics.find(m=>m.name==='NavigationStart')?.value;
  if(!navigationStart||!Number.isFinite(navigationStart))throw Error('browser_monotonic_origin_unavailable');
  for(const item of selected){const a=available.get(item.path),l=loaded[item.path];if(l===undefined){samples.push(Infinity);failed++;}else if(a===undefined){samples.push(Infinity);invalidTiming++;}else{const delta=l-(a-navigationStart*1000);if(!Number.isFinite(delta)||delta<=0){samples.push(Infinity);invalidTiming++;}else samples.push(delta);}}
  pageMs.push(Date.now()-start);await context.close();
 }
 const ordered=[...samples].sort((a,b)=>a-b),p95=ordered[Math.ceil(ordered.length*.95)-1]!,underTwoSeconds=samples.filter(s=>s<=2000).length;
 expect(transferBytes.every(size=>size>0&&size<=204800)).toBe(true);
 const proof={clockSource:'browser monotonic: CDP redirect timestamp minus NavigationStart, compared to performance.now load event',invalidTiming,maxTransferBytes:Math.max(...transferBytes),gate:'G-P',date:new Date().toISOString(),visits:30,catalogue:20,images:120,network:{downloadBitsPerSecond:10000000,latencyMs:80,cache:'empty'},underTwoSeconds,failed,p95Ms:Number.isFinite(p95)?p95:null,authorizationMs,pageMs,status:underTwoSeconds>=114&&invalidTiming===0?'PASS':'FAIL'};
 await writeFile(new URL('../../backend/specs/025-direct-media-delivery/performance.md',import.meta.url),'# Performance — 025\n\n```json\n'+JSON.stringify(proof,null,2)+'\n```\n');expect(invalidTiming).toBe(0);expect(underTwoSeconds).toBeGreaterThanOrEqual(114);
});
