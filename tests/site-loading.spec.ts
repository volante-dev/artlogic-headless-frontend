import {test,expect} from '@playwright/test';
for(const width of [375,1440])for(const reducedMotion of ['reduce','no-preference'] as const)test(`generic navigation loader at ${width}px with ${reducedMotion}`,async({page},testInfo)=>{
 test.setTimeout(90000);await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion});const english=width===375,home=english?'/en':'/',target=english?'/en/contact':'/contact';
 await page.goto(home,{waitUntil:'domcontentloaded'});await expect(page.locator('main[data-header-state="ready"]')).toBeVisible({timeout:45000});await page.waitForFunction(()=>Boolean(document.querySelector<HTMLElement>('header')?.style.getPropertyValue('--site-menu-header-height')));
 const header=await page.locator('header:visible').elementHandle();await page.evaluate(()=>Object.assign(window,{loaderDocument:'same'}));
 let release=()=>{};const held=new Promise<void>(resolve=>{release=resolve;});
 await page.route(`**${target}?*`,async route=>{if(route.request().headers().rsc!=='1'){await route.continue();return;}const response=await route.fetch();await held;await route.fulfill({response});});
 try{
  if(width===375)await page.getByRole('button',{name:'Open menu',exact:true}).click();
  await page.locator(`header a[href="${target}"]`).click({noWaitAfter:true});const loader=page.locator('[data-header-status][role="progressbar"]');
  await expect(loader).toBeVisible();await expect(loader).toHaveAccessibleName(english?'Loading':'Chargement en cours');await expect(loader).toHaveText('');await expect(page.locator('main')).toBeHidden();
  const indicator=loader.locator('span').first();await expect.poll(()=>indicator.evaluate(el=>getComputedStyle(el).opacity)).toBe('1');
  const track=indicator.locator('span');const animation=await track.evaluate(el=>getComputedStyle(el).animationName);expect(animation==='none').toBe(reducedMotion==='reduce');
  expect(await header!.evaluate(el=>el.isConnected&&el.checkVisibility())).toBe(true);await page.screenshot({path:testInfo.outputPath('generic-loader.png')});
  release();await expect(page).toHaveURL(new RegExp(target+'$'));await expect(page.locator('main[data-header-state="ready"]')).toBeVisible();await expect(loader).toHaveCount(0);expect(await page.evaluate(()=>Reflect.get(window,'loaderDocument'))).toBe('same');
 }finally{release();await page.unrouteAll({behavior:'ignoreErrors'});}
});
