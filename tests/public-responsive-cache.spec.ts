import{test,expect}from'@playwright/test';
test('reuses one browser rendition ten times and keeps SPA navigation and both observation routes',async({page,browserName})=>{
 const cdp=browserName==='chromium'?await page.context().newCDPSession(page):undefined;let transferred=0;const ids=new Set<string>();let target='';
 if(cdp){await cdp.send('Network.enable');cdp.on('Network.requestWillBeSent',e=>{if(target&&new URL(e.request.url).pathname==='/media/'+target)ids.add(e.requestId);});cdp.on('Network.dataReceived',e=>{if(ids.has(e.requestId))transferred+=e.encodedDataLength;});}
 await page.goto('/artworks');const first=page.locator('[data-artwork-card] img').first();await expect.poll(()=>first.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);target=(await first.getAttribute('data-public-image-resource'))!.split(':')[1];
 // Warm this exact rendition completely before counting its payload again.
 await first.evaluate(n=>(n as HTMLImageElement).decode());
 for(let n=0;n<10;n++){transferred=0;ids.clear();await page.reload();const image=page.locator('[data-artwork-card] img').first();await expect.poll(()=>image.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);await image.evaluate(n=>(n as HTMLImageElement).decode());if(cdp)expect(transferred).toBe(0);}
 const legacy=await page.evaluate(async id=>(await fetch('/api/media-observations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resourceKind:'artwork',resourceId:id,displayId:'legacy.recipe',retry:0,event:'loaded',elapsedMs:1})})).status,target);expect(legacy).toBe(204);
 await page.evaluate(()=>Reflect.set(window,'imageDocumentMarker','same'));await page.locator('[data-artwork-card] a').first().click();await expect(page.locator('[data-artwork-experience]')).toBeVisible();expect(await page.evaluate(()=>Reflect.get(window,'imageDocumentMarker'))).toBe('same');
});
