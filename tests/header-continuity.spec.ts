import {expect,test} from "@playwright/test";
test.use({trace:'on'});
test.describe('visual continuity',()=>{
for(const width of [1440,375])test(`header preserves document, context and history at ${width}px`,async({page},testInfo)=>{
 test.setTimeout(120000);await page.setViewportSize({width,height:900});await page.goto('/');await expect(page.locator('main[data-header-state="ready"]')).toBeVisible();await page.waitForFunction(()=>Boolean(document.querySelector<HTMLElement>('header')?.style.getPropertyValue('--site-menu-header-height')));
 await page.evaluate(async()=>{await document.fonts.ready;(window as unknown as {headerDocument:string}).headerDocument='same-document';});
 await page.evaluate(()=>{const header=document.querySelector('header')!,font=getComputedStyle(header.querySelector('a')!).fontFamily,logo=header.querySelector('a')!.getBoundingClientRect();let frames=0,failures=0;const problems:unknown[]=[];const sample=()=>{frames++;const main=header.closest('[data-artwork-route]')?.querySelector<HTMLElement>('main'),wrongContrast=main?.dataset.headerState==='ready'&&main.dataset.pageKey==='contact'&&getComputedStyle(header).color!==getComputedStyle(document.body).color;if(wrongContrast||!header.isConnected||!header.checkVisibility()||getComputedStyle(header).visibility!=='visible'||getComputedStyle(header.querySelector('a')!).fontFamily!==font||Math.abs(header.querySelector('a')!.getBoundingClientRect().width-logo.width)>1||Math.abs(header.querySelector('a')!.getBoundingClientRect().height-logo.height)>1){failures++;if(problems.length<10)problems.push({wrongContrast,color:getComputedStyle(header).color,body:getComputedStyle(document.body).color,instant:header.hasAttribute('data-navigation-instant'),menu:header.dataset.menuState,page:main?.dataset.pageKey,status:main?.dataset.headerState,width:header.querySelector('a')!.getBoundingClientRect().width,expectedWidth:logo.width,visibility:getComputedStyle(header).visibility});}Object.assign(window,{headerVisual:{frames,failures,problems}});requestAnimationFrame(sample);};requestAnimationFrame(sample);});
 const geometry=await page.locator('header').boundingBox();
 const header=await page.locator('header:visible').elementHandle();let documents=0;
 page.on('request',request=>{if(request.isNavigationRequest()&&request.resourceType()==='document'&&request.frame()===page.mainFrame())documents++;});
 for(let i=0;i<20;i++){
  if(width===375)await page.getByRole('button',{name:'Ouvrir le menu'}).click();
  const target=i%2===0?'/contact':'/';
  if(target==='/')await page.getByRole('link',{name:/Retour à l’accueil/}).click();
  else await page.getByRole('navigation',{name:'Navigation principale'}).getByRole('link',{name:'Contact',exact:true}).click();
  await expect(page).toHaveURL(new RegExp(target==='/'?'/$':'/contact$'));
  await expect(page.locator('main')).toBeVisible();
  expect(await page.evaluate(()=>(window as unknown as {headerDocument:string}).headerDocument)).toBe('same-document');
  expect(await header!.evaluate(node=>node.isConnected&&node.checkVisibility())).toBe(true);
  if(target==='/'){const box=await page.locator('header').boundingBox();expect(Math.abs(box!.height-geometry!.height)).toBeLessThanOrEqual(1);}
  if(i<2)await page.screenshot({path:testInfo.outputPath(`header-${i}.png`)});
  if(target!=='/')await expect(page.locator('header a[aria-current="page"]')).toHaveText('Contact');
 }
 for(let i=0;i<10;i++){
  if(i%2===0)await page.goBack();else await page.goForward();
  await expect(page.locator('main')).toBeVisible();
  expect(await page.evaluate(()=>(window as unknown as {headerDocument:string}).headerDocument)).toBe('same-document');
 }
 expect(documents).toBe(0);
 const visual=await page.evaluate(()=>Reflect.get(window,'headerVisual') as {frames:number;failures:number});expect(visual.frames).toBeGreaterThan(20);expect(visual.failures,JSON.stringify(visual)).toBe(0);
 await testInfo.attach('visual-continuity',{body:JSON.stringify(visual),contentType:'application/json'});
});

});

test('history verifies a changed publication before revealing retained home content',async({page,request})=>{
 const {control}=await import('./helpers');
 await page.goto('/');await page.getByRole('navigation',{name:'Navigation principale'}).getByRole('link',{name:'Contact',exact:true}).click();await expect(page.locator('main')).toBeVisible();
 try{
  await control(request,'presentation-mode',{mode:'withdrawn'});
  await page.evaluate(()=>{const samples:string[]=[];Object.assign(window,{headerSamples:samples});const sample=()=>{const main=document.querySelector('main');if(main&&getComputedStyle(main).visibility==='visible')samples.push([...main.querySelectorAll('h1,h2')].filter(node=>(node as HTMLElement).checkVisibility()&&getComputedStyle(node).visibility==='visible').map(node=>node.textContent).join(' '));requestAnimationFrame(sample);};requestAnimationFrame(sample);});
  await page.goBack();await expect(page.locator('main')).toBeVisible();await expect(page.getByRole('heading',{name:'Notre galerie',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>(Reflect.get(window,'headerSamples') as string[]).some(text=>text.includes('L’art, au premier regard.')))).toBe(false);
 }finally{await control(request,'presentation-mode',{mode:'demo'});}
});

test('a withdrawn gallerist destination renders a local error and leaves header usable',async({page,request})=>{
 const {control}=await import('./helpers');await control(request,'header-galerist',{mode:'enabled'});
 try{
  await page.goto('/');await page.evaluate(()=>Object.assign(window,{headerDocument:'unchanged'}));
  await control(request,'header-galerist',{mode:'disabled'});
  await page.locator('header').getByRole('link',{name:'Galeriste de recette',exact:true}).click();
  await expect(page).toHaveURL(/\/galeriste-recette$/);await expect(page.locator('main')).toBeVisible();await expect(page.getByRole('heading',{name:'Page introuvable',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>Reflect.get(window,'headerDocument'))).toBe('unchanged');
  await page.locator('header').getByRole('link',{name:'Contact',exact:true}).click();await expect(page.locator('main')).toBeVisible();await expect(page.locator('header a[aria-current="page"]')).toHaveText('Contact');
 }finally{await control(request,'header-galerist',{mode:'disabled'});}
});

test('locale then another header destination clears the old page translation',async({page})=>{
 await page.goto('/');await page.evaluate(()=>Object.assign(window,{localeHeaderDocument:'same'}));await page.locator('header').getByRole('link',{name:'English',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('lang','en');
 await page.locator('header').getByRole('link',{name:'Contact',exact:true}).click();await expect(page).toHaveURL(/\/en\/contact$/);await expect(page.locator('main:visible')).toBeVisible();
 await expect(page.locator('header:visible a[aria-current="page"]')).toHaveText('Contact');
 await page.locator('header').getByRole('link',{name:/Back to home/}).click();await expect(page).toHaveURL(/\/en$/);await expect(page.getByRole('heading',{name:'Art, at first sight.',exact:true})).toBeVisible();expect(await page.evaluate(()=>Reflect.get(window,'localeHeaderDocument'))).toBe('same');
});

test('modified activation opens a new tab and keyboard navigation stays in the document',async({page,context,browserName})=>{
 await page.goto('/');const contact=page.locator('header').getByRole('link',{name:'Contact',exact:true});await expect(contact).toHaveAttribute('href','/contact');
 await page.evaluate(()=>Object.assign(window,{headerDocument:'unchanged'}));
 const popup=context.waitForEvent('page');await contact.click({modifiers:[process.platform==='darwin'?'Meta':'Control']});const other=await popup;await other.waitForLoadState('domcontentloaded');await expect(other).toHaveURL(/\/contact$/);await other.close();
 expect(await page.evaluate(()=>Reflect.get(window,'headerDocument'))).toBe('unchanged');await expect(page).toHaveURL(/\/$/);
 await contact.focus();await page.keyboard.press('Enter');await expect(page.locator('main')).toBeVisible();await expect(page).toHaveURL(/\/contact$/);expect(await page.evaluate(()=>Reflect.get(window,'headerDocument'))).toBe('unchanged');void browserName;
});

test('native header hrefs remain usable without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL});try{const page=await context.newPage();await page.goto('/');await page.locator('header').getByRole('link',{name:'Contact',exact:true}).click();await expect(page).toHaveURL(/\/contact$/);await expect(page.locator('header').getByRole('link',{name:/Retour à l’accueil/})).toBeVisible();}finally{await context.close();}
});

test('a missing proof times out locally and the latest destination wins over a late response',async({page})=>{
 test.setTimeout(35000);await page.goto('/');await page.evaluate(()=>Object.assign(window,{headerDocument:'same'}));
 let release=()=>{};const held=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/contact?*',async route=>{if(route.request().headers().rsc!=='1'){await route.continue();return;}const response=await route.fetch();await held;await route.fulfill({response});});
 try{
  await page.locator('header a[href="/contact"]').click();await expect(page.locator('[data-header-status][role="alert"]')).toBeVisible({timeout:15000});
  await expect(page.locator('header')).toBeVisible();await expect(page.locator('main')).toBeHidden();
  await page.locator('header a[href="/expertise"]').click();await expect(page).toHaveURL(/\/expertise$/);await expect(page.locator('main')).toBeVisible();release();
  await expect(page.locator('header a[aria-current="page"]')).toHaveText('Demande d’expertise');expect(await page.evaluate(()=>Reflect.get(window,'headerDocument'))).toBe('same');
 }finally{release();}
});

test('retry after a timeout resumes the requested destination without a document reload',async({page})=>{
 test.setTimeout(35000);await page.goto('/');await page.evaluate(()=>Object.assign(window,{headerDocument:'same'}));
 let release=()=>{};const held=new Promise<void>(resolve=>{release=resolve;});let block=true;
 await page.route('**/contact?*',async route=>{if(route.request().headers().rsc!=='1'||!block){await route.continue();return;}const response=await route.fetch();await held;await route.fulfill({response});});
 try{
  await page.locator('header a[href="/contact"]').click();const error=page.locator('[data-header-status][role="alert"]');await expect(error).toBeVisible({timeout:15000});
  block=false;await error.getByRole('button',{name:'Réessayer'}).click({noWaitAfter:true});release();await expect(page).toHaveURL(/\/contact$/);await expect(page.locator('main')).toBeVisible();expect(await page.evaluate(()=>Reflect.get(window,'headerDocument'))).toBe('same');
 }finally{release();}
});

test('history keys follow allowed query rules rather than parameter ordering',async({page})=>{
 await page.goto('/artworks?pageSize=3&page=1');await expect(page.getByTestId('artwork-card')).toHaveCount(3);
 await page.locator('header a[href="/contact"]').click();await expect(page.locator('main')).toBeVisible();await page.goBack();await expect(page.locator('main')).toBeVisible();await expect(page.getByTestId('artwork-card').filter({visible:true})).toHaveCount(3);
});
test('an already loaded logo remains readable through header navigation',async({page,request})=>{
 const {control}=await import('./helpers');await control(request,'logo');
 try{await page.goto('/');const logo=page.locator('header').getByTestId('site-logo');await expect.poll(()=>logo.evaluate(node=>(node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);const image=await logo.elementHandle();await page.locator('header a[href="/contact"]').click();await expect(page.locator('main')).toBeVisible();expect(await image!.evaluate(node=>node.isConnected&&(node as HTMLImageElement).naturalWidth>0)).toBe(true);}finally{await control(request,'remove-logo');}
});

test('repeating an unresolved destination requires a new publication check',async({page,request})=>{
 test.setTimeout(35000);const {control}=await import('./helpers');await control(request,'header-galerist',{mode:'enabled'});
 let release=()=>{},fetched=()=>{};const held=new Promise<void>(resolve=>{release=resolve;}),received=new Promise<void>(resolve=>{fetched=resolve;});let first=true;
 try{
  await page.goto('/');await page.route('**/galeriste-recette?*',async route=>{if(!first||route.request().headers().rsc!=='1'){await route.continue();return;}first=false;const response=await route.fetch();fetched();await held;await route.fulfill({response});});
  const link=page.locator('header a[href="/galeriste-recette"]');await link.click({noWaitAfter:true});await received;await control(request,'header-galerist',{mode:'disabled'});await link.click({noWaitAfter:true});release();
  await expect(page).toHaveURL(/\/galeriste-recette$/);await expect(page.locator('main')).toBeVisible();await expect(page.getByRole('heading',{name:'Page introuvable',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Parcours de recette',exact:true})).toHaveCount(0);
 }finally{release();await control(request,'header-galerist',{mode:'disabled'});}
});

test('same-document anchor history does not start a publication refresh',async({page})=>{
 await page.goto('/news');await page.locator('header a[href="/contact"]').click();await expect(page.locator('main')).toBeVisible();
 await page.evaluate(()=>{const main=document.querySelector('main')!;Object.assign(window,{anchorMasked:false});const observer=new MutationObserver(records=>{if(records.some(record=>record.oldValue?.includes('visibility: hidden'))||getComputedStyle(main).visibility==='hidden')Object.assign(window,{anchorMasked:true});});observer.observe(main,{attributes:true,attributeOldValue:true,attributeFilter:['style']});history.pushState(history.state,'','#contenu');});
 await page.goBack();await expect(page).toHaveURL(/\/contact$/);expect(await page.evaluate(()=>Reflect.get(window,'anchorMasked'))).toBe(false);await expect(page.locator('main')).toBeVisible();
});

test('history remains fresh after a language change followed by a header visit',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>Boolean(document.querySelector<HTMLElement>('header')?.style.getPropertyValue('--site-menu-header-height')));await page.evaluate(()=>Object.assign(window,{languageHistoryDocument:'same'}));await page.locator('header').getByRole('link',{name:'English',exact:true}).click();await expect(page).toHaveURL(/\/en$/);
 await page.locator('header a[href="/en/contact"]').click();await expect(page).toHaveURL(/\/en\/contact$/);await expect(page.locator('main:visible')).toBeVisible();
 await page.goBack();await expect(page).toHaveURL(/\/en$/);await expect(page.locator('main:visible')).toBeVisible();await expect(page.getByRole('heading',{name:'Art, at first sight.',exact:true})).toBeVisible();
 await page.goForward();await expect(page).toHaveURL(/\/en\/contact$/);await expect(page.locator('main:visible')).toBeVisible();await expect(page.locator('header:visible a[aria-current="page"]')).toHaveText('Contact');expect(await page.evaluate(()=>Reflect.get(window,'languageHistoryDocument'))).toBe('same');
});
