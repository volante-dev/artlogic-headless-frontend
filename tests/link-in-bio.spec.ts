import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import type {BrowserContext} from '@playwright/test';
test.skip(process.env.E2E_LINK_IN_BIO!=='true','Requires the isolated Link in bio browser fixture');
async function images(context:BrowserContext){const bytes=Buffer.from(JSON.parse(readFileSync(process.env.E2E_FIXTURE_PATH!,'utf8')).linkBioImage,'base64');await context.route('https://link-bio-images.example.test/**',route=>route.fulfill({body:bytes,contentType:'image/webp',headers:{'Cache-Control':'public, max-age=21600'}}));}
test.beforeEach(async({context})=>{await images(context);});
test('shows three portrait columns, twelve posts and only configured links',async({page})=>{
 const external:string[]=[];page.on('request',request=>{if(/(?:graph\.instagram|graph\.facebook|instagram\.com)/.test(request.url()))external.push(request.url());});
 for(const width of [1440,375]){
  await page.setViewportSize({width,height:900});await page.goto('/link-in-bio');
  await expect(page.locator('[data-link-bio-post]')).toHaveCount(12);
  const grid=page.locator('[data-link-bio-grid]');expect(await grid.evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(3);
  const box=await page.locator('[data-link-bio-thumbnail]').first().boundingBox();expect(box!.width/box!.height).toBeCloseTo(.75,2);
  await page.getByRole('button',{name:'Afficher plus'}).click();await expect(page.locator('[data-link-bio-post]')).toHaveCount(24);
  await expect(page.locator('[data-link-bio-post] a')).toHaveCount(20);
  await expect(page.locator('[data-link-bio-post]').nth(23).locator('a,button,[tabindex]')).toHaveCount(0);
 }
 expect(external).toEqual([]);
});
test('appends all fifty in order and retains visible posts on a continuation error',async({page})=>{
 await page.goto('/link-in-bio');await page.route('**/api/link-in-bio?*',route=>route.fulfill({status:503,json:{error:{code:'dependency_unavailable',message:'Réessayez.',details:[],requestId:'synthetic'}}}));
 await page.getByRole('button',{name:'Afficher plus'}).click();await expect(page.locator('[data-link-bio-continuation]').getByRole('alert')).toBeVisible();await expect(page.locator('[data-link-bio-post]')).toHaveCount(12);
 await page.unroute('**/api/link-in-bio?*');await page.getByRole('button',{name:'Réessayer'}).click();
 for(const count of [24,36,48]){await expect(page.locator('[data-link-bio-post]')).toHaveCount(count);await page.getByRole('button',{name:'Afficher plus'}).click();}
 await expect(page.locator('[data-link-bio-post]')).toHaveCount(50);
 expect(await page.locator('[data-link-bio-post]').evaluateAll(nodes=>new Set(nodes.map(node=>node.getAttribute('data-link-bio-post'))).size)).toBe(50);
 await expect(page.getByRole('button',{name:'Afficher plus'})).toHaveCount(0);
});
test('opens an artwork without reloading the document and restores the grid',async({page})=>{
 await page.goto('/link-in-bio');await page.getByRole('button',{name:'Afficher plus'}).click();
 await page.evaluate(()=>{(window as unknown as {__linkBioDocument:string}).__linkBioDocument='kept';});
 const link=page.locator('[data-link-bio-post] a').first();await link.click();await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('button',{name:'Fermer la fiche de l’œuvre',exact:true}).click();await expect(page).toHaveURL(/\/link-in-bio$/);
 await expect(page.locator('[data-link-bio-post]')).toHaveCount(24);expect(await page.evaluate(()=>(window as unknown as {__linkBioDocument:string}).__linkBioDocument)).toBe('kept');
});
test('navigates to an article and restores the loaded batches on Back',async({page})=>{
 await page.goto('/link-in-bio');await page.getByRole('button',{name:'Afficher plus'}).click();await page.locator('[data-link-bio-post]').nth(1).locator('a').click();await expect(page).toHaveURL(/\/publications\/publication-link-in-bio$/);await expect(page.getByRole('heading',{name:'Publication Link in bio',exact:true})).toBeVisible();await page.goBack();await expect(page).toHaveURL(/\/link-in-bio$/);await expect(page.locator('[data-link-bio-post]')).toHaveCount(24);
});
test('keeps the initial grid and native destinations available without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false});try{await images(context);const page=await context.newPage();const response=await page.goto(baseURL+'/link-in-bio');expect(response?.status()).toBe(200);await expect(page.locator('[data-link-bio-post]')).toHaveCount(12);const href=await page.locator('[data-link-bio-post] a').first().getAttribute('href');expect(href).toMatch(/^\/artworks\//);await page.locator('[data-link-bio-post] a').first().click();await expect(page).toHaveURL(/\/artworks\//);}finally{await context.close();}
});
test('uses localized destinations without contacting Instagram',async({page})=>{await page.goto('/en/link-in-bio');await expect(page.locator('[data-link-bio-post]')).toHaveCount(12);await expect(page.locator('[data-link-bio-post] a').first()).toHaveAttribute('href',/^\/en\/artworks\//);await expect(page.locator('[data-link-bio-post]').nth(1).locator('a')).toHaveAttribute('href','/en/publications/link-in-bio-publication');await expect(page.getByRole('button',{name:'Show more'})).toBeVisible();});
test('keeps modified clicks native and leaves the origin document intact',async({page,context})=>{await page.goto('/link-in-bio');const opened=context.waitForEvent('page');await page.locator('[data-link-bio-post] a').first().click({modifiers:['ControlOrMeta']});const target=await opened;try{await target.waitForURL(/\/artworks\//);await expect(page).toHaveURL(/\/link-in-bio$/);await expect(page.locator('[data-link-bio-post]')).toHaveCount(12);}finally{await target.close();}});
test('records the approved desktop and mobile structure',async({page,browserName})=>{
 test.skip(browserName!=='chromium','Visual evidence recorded in Chromium; WebKit uses the functional matrix');
 const directory=new URL('../.impeccable/review/link-in-bio/',import.meta.url);await mkdir(directory,{recursive:true});
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',375,900]] as const){
  await page.setViewportSize({width,height});await page.goto('/link-in-bio');await expect(page.locator('[data-link-bio-post]')).toHaveCount(12);
  const acknowledgement=page.getByRole('button',{name:'Compris',exact:true});if(await acknowledgement.isVisible())await acknowledgement.click();
  // Hide development tooling only; the shipping page's own UI remains intact.
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.evaluate(async()=>{await document.fonts.ready;window.scrollTo(0,document.body.scrollHeight);});
  await expect.poll(()=>page.locator('[data-link-bio-thumbnail] img').evaluateAll(nodes=>nodes.every(node=>(node as HTMLImageElement).complete&&(node as HTMLImageElement).naturalWidth>0))).toBe(true);
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:new URL(name+'.png',directory).pathname,fullPage:true});
 }
});

test('keeps the three activation states local and works without optional consent or Instagram login',async({page,context})=>{
 test.setTimeout(90000);const change=async(mode:string)=>{const response=await page.request.post(process.env.E2E_CONTROL_URL+'/control',{headers:{'x-test-control':process.env.E2E_CONTROL_KEY!},data:{action:'link-bio-state',mode}});expect(response.ok()).toBe(true);};
 let probe=page;
 try{for(const [mode,status] of [['published',200],['unpublished',404],['frontend-closed',404]] as const){await probe.close();await change(mode);probe=await context.newPage();expect((await probe.goto('/link-in-bio'))?.status()).toBe(status);await expect(probe.locator('[data-link-bio-post]')).toHaveCount(status===200?12:0);}expect((await probe.request.get('/artworks')).status()).toBe(200);}finally{await probe.close();await change('published');}

});
test('keeps unlinked cells out of keyboard navigation and honors reduced motion on mobile',async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:375,height:900});await page.goto('/link-in-bio');await page.getByRole('button',{name:'Afficher plus'}).click();const unlinked=page.locator('[data-link-bio-post]').nth(23);await expect(unlinked.locator('a,button,[tabindex]')).toHaveCount(0);const first=page.locator('[data-link-bio-post] a').first();await page.keyboard.press('Tab');await first.focus();await expect(first).toBeFocused();expect(await first.evaluate(node=>getComputedStyle(node).outlineStyle)).not.toBe('none');await expect(page.getByRole('navigation',{name:'Liens à découvrir'})).toBeVisible();});
