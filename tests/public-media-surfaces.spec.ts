import {test,expect} from "@playwright/test";
import {control} from "./helpers";
test.use({trace:"off",screenshot:"off",video:"off"});
test("normal and inverse logos preserve fallback and direct loading on mobile",async({page,request})=>{
 await control(request,'logo');try{
  for(const width of [375,1440]){await page.setViewportSize({width,height:900});await page.goto('/');const logo=page.getByTestId('site-logo').first();await expect(logo).toBeVisible();await expect.poll(()=>logo.evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);}
 }finally{await control(request,'remove-logo');}
});
test("stable image URLs still work without JavaScript",async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL});try{const page=await context.newPage();await page.goto('/artworks');const img=page.getByTestId('artwork-image').first();await expect(img).toBeAttached();await expect.poll(()=>img.evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);}finally{await context.close();}
});
test("social image references and historical media addresses remain authorized stable paths",async({page,request})=>{
 const {fixture}=await import('./helpers');await page.goto('/artworks/'+fixture().published[0]!.id);
 const meta=await page.locator('meta[property="og:image"]').getAttribute('content');expect(meta).toBeTruthy();const url=new URL(meta!,page.url());expect(url.origin).toBe(new URL(page.url()).origin);expect(url.pathname).toMatch(/^\/media\/[0-9a-f-]{36}$/);expect(url.search).not.toContain('X-Amz');
 const redirect=await request.get(url.href,{maxRedirects:0});expect(redirect.status()).toBe(307);const terminal=await request.get(url.href);expect(terminal.status()).toBe(200);expect(terminal.headers()['content-type']).toContain('image/webp');
 const id=url.pathname.split('/').at(-1);const api=await request.get(fixture().backendOrigin+'/v1/public/media/'+id,{maxRedirects:0});expect(api.status()).toBe(200);expect(api.headers().location).toBeUndefined();
});
test("active languages preserve media identity and proportions",async({page})=>{
 const ids:string[][]=[];
 for(const path of ['/artworks','/en/artworks']){await page.goto(path);const images=page.getByTestId('artwork-image');await expect(images.first()).toBeVisible();await expect.poll(()=>images.first().evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);ids.push(await images.evaluateAll(els=>els.slice(0,4).map(e=>{const img=e as HTMLImageElement;return new URL(img.src).pathname+':'+img.width+':'+img.height;})));}
 expect(ids[0]).toEqual(ids[1]);
});
test("a multi-photo artwork preserves media order, examination and finale through direct delivery",async({page})=>{
 const {fixture}=await import('./helpers');const art=fixture().published.find(a=>(a.mediaCount??0)>1);expect(art).toBeTruthy();await page.goto('/artworks/'+art!.id);
 const root=page.getByTestId('artwork-experience');await expect(root).toHaveAttribute('data-artwork-opening-phase','complete');
 const photos=root.getByTestId('artwork-image');expect(await photos.count()).toBeGreaterThanOrEqual(3);const ids=await photos.evaluateAll(nodes=>nodes.map(n=>new URL((n as HTMLImageElement).src).pathname));expect(new Set(ids).size).toBe(3);
 const views=root.getByRole('navigation',{name:'Vues de l’œuvre'}).getByRole('button');await views.nth(1).click();const second=root.locator('[data-view="1"] img').first();await expect.poll(()=>second.evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);
 const zoom=root.locator('button[data-artwork-entry-controls][aria-pressed]').first();await expect(zoom).toBeVisible();await zoom.click();await expect(zoom).toHaveAttribute('aria-pressed','true');await zoom.focus();await page.keyboard.press('Escape');await expect(zoom).toHaveAttribute('aria-pressed','false');
 await root.getByRole('button',{name:'Conclusion',exact:true}).click();await expect(root.locator('[data-artwork-finale]')).toHaveAttribute('data-finale-open','true');expect((await root.locator('img').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src')))).some(src=>src?.includes('X-Amz'))).toBe(false);expect(await page.getByRole('link',{name:'Demander des informations',exact:true}).count()).toBeGreaterThan(0);
});
