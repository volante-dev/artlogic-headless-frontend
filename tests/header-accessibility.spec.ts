import {control} from "./helpers";
import {test,expect} from "@playwright/test";
for(const width of [375,1440])test("header keyboard, skip link and language at "+width+"px",async({page,browserName})=>{
 await page.setViewportSize({width,height:900});await page.goto("/news");const home=page.getByRole("link",{name:/Retour à l’accueil/});await expect(home).toBeVisible();
 await home.focus();await page.keyboard.press(browserName==="webkit"?"Alt+Shift+Tab":"Shift+Tab");await expect(page.getByRole("link",{name:"Aller au contenu"})).toBeFocused();await page.keyboard.press("Enter");await expect(page.locator("main")).toBeFocused();
 await home.focus();await page.keyboard.press(browserName==="webkit"?"Alt+Tab":"Tab");
 if(width===375){
  const toggle=page.getByRole("button",{name:"Ouvrir le menu"});await expect(toggle).toBeFocused();await expect(page.locator("#site-navigation")).toBeHidden();await page.keyboard.press("Enter");await expect(page.getByRole("button",{name:"Fermer le menu"})).toHaveAttribute("aria-expanded","true");await page.keyboard.press(browserName==="webkit"?"Alt+Tab":"Tab");await expect(page.getByRole("link",{name:"Actualités",exact:true})).toBeFocused();await page.keyboard.press("Escape");await expect(toggle).toBeFocused();await expect(page.locator("#site-navigation")).toBeHidden();await page.keyboard.press("Enter");
 }
 const english=page.getByRole("navigation",{name:"Langue",exact:true}).getByRole("link",{name:"English",exact:true});await english.focus();await page.keyboard.press("Enter");await expect(page.locator("html")).toHaveAttribute("lang","en");
 if(width===375)await expect(page.locator("#site-navigation")).toBeHidden();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(page.getByRole("link",{name:/Back to home/})).toBeVisible();await expect(page.getByRole("heading",{level:1})).toBeVisible();await page.evaluate(()=>scrollTo(0,0));if(width===375)await page.getByRole("button",{name:"Open menu"}).click();await page.screenshot({path:"test-results/header-"+width+".png"});
});
test("resizing a focused desktop navigation to compact restores a visible focus target",async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto("/news");await page.getByRole("navigation",{name:"Navigation principale"}).getByRole("link",{name:"Contact",exact:true}).focus();await page.setViewportSize({width:375,height:900});await expect(page.getByRole("button",{name:"Ouvrir le menu"})).toBeFocused();
 await page.getByRole("button",{name:"Ouvrir le menu"}).click();await page.setViewportSize({width:1440,height:900});await expect(page.getByRole("button",{name:/Ouvrir le menu|Fermer le menu/})).toBeHidden();await expect(page.locator("header")).toHaveAttribute("data-menu-state","closed");await page.setViewportSize({width:375,height:900});await expect.poll(()=>page.evaluate(()=>({compact:matchMedia("(max-width:1099px)").matches,state:document.querySelector("header")?.getAttribute("data-menu-state"),visibility:getComputedStyle(document.querySelector("#site-navigation")!).visibility}))).toMatchObject({compact:true,state:"closed",visibility:"hidden"});
});

test("maximum-length labels remain reachable without horizontal overflow",async({page,request})=>{
 await control(request,"long-labels");try{for(const width of [375,1440]){await page.setViewportSize({width,height:900});await page.goto("/news");await expect(page.getByRole("link",{name:/Retour à l’accueil/})).toBeVisible();if(width===375)await page.getByRole("button",{name:/Ouvrir le menu/}).click();const nav=page.getByRole("navigation",{name:/Navigation principale/});await expect(nav.getByRole("link")).toHaveCount(6);for(const link of await nav.getByRole("link").all())await expect(link).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}}
 finally{await control(request,"reset-labels");}
});

test('compact touch navigation works with reduced motion and releases its locks',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,viewport:{width:375,height:812},hasTouch:true,reducedMotion:'reduce'});
 try{
  const page=await context.newPage();await page.goto('/news');await page.evaluate(()=>Object.assign(window,{touchHeaderDocument:'same'}));
  const toggle=page.getByRole('button',{name:'Ouvrir le menu'});await toggle.tap();await page.keyboard.press('Escape');await expect(toggle).toBeFocused();await expect(page).toHaveURL(/\/news$/);
  await toggle.tap();await page.locator('header').getByRole('link',{name:'Contact',exact:true}).tap();await expect(page).toHaveURL(/\/contact$/);await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('main')).not.toHaveAttribute('inert','');expect(await page.evaluate(()=>document.documentElement.style.overflow)).not.toBe('hidden');expect(await page.evaluate(()=>Reflect.get(window,'touchHeaderDocument'))).toBe('same');
 }finally{await context.close();}
});

test('closing a menu opened during navigation releases a freshness lock that has completed',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.goto('/news');
 let release=()=>{};const held=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/contact?*',async route=>{if(route.request().headers().rsc!=='1'){await route.continue();return;}const response=await route.fetch();await held;await route.fulfill({response});});
 try{
  await page.getByRole('button',{name:'Ouvrir le menu'}).click();await page.locator('header a[href="/contact"]').click({noWaitAfter:true});
  await page.getByRole('button',{name:'Ouvrir le menu'}).click();release();await expect(page).toHaveURL(/\/contact$/);await expect(page.locator('header a[aria-current="page"]')).toHaveText('Contact');
  await page.keyboard.press('Escape');await expect(page.locator('main')).not.toHaveAttribute('inert','');expect(await page.evaluate(()=>document.documentElement.style.overflow)).not.toBe('hidden');
 }finally{release();}
});
