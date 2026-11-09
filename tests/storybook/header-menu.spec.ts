import {test,expect,type Page} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import {createRequire} from "node:module";
import {dirname} from "node:path";
const require=createRequire(import.meta.url);
const axePath=require.resolve("axe-core/axe.min.js",{paths:[dirname(require.resolve("@storybook/addon-a11y/package.json"))]});
async function visit(page:Page,width=390,height=844,story="default",theme="projection",locale="fr"){
 await page.setViewportSize({width,height});
 await page.goto(`/iframe.html?id=components-siteheader--${story}&viewMode=story&globals=theme:${theme};locale:${locale};width:${width}`);
 await expect(page.locator("[data-catalog-ready]")).toBeVisible();
 await expect(page.locator(".sb-errordisplay")).not.toBeVisible();
}
const toggle=(page:Page)=>page.locator('button[aria-controls="site-navigation"]');
async function settled(page:Page){const header=page.locator("header");if(await toggle(page).isVisible()&&await header.getAttribute("data-menu-state")==="open")await expect(header).toHaveAttribute("data-menu-motion","open");await expect.poll(()=>header.evaluate(node=>node.getAnimations({subtree:true}).length)).toBe(0);}
async function capture(page:Page,name:string){await mkdir(".impeccable/review/mobile-menu",{recursive:true});await page.screenshot({path:`.impeccable/review/mobile-menu/${name}-${test.info().project.name}.png`,scale:"css"});}

test("two lines morph into a cross; keyboard and background stay inside the open menu",async({page})=>{
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));await visit(page);
 const trigger=toggle(page),nav=page.locator("#site-navigation");
 await expect(trigger).toHaveAccessibleName("Ouvrir le menu");await expect(trigger.locator("span span")).toHaveCount(2);
 await expect(trigger).toHaveText("");expect(await trigger.boundingBox()).toMatchObject({width:48,height:48});
 await expect(nav).toBeHidden();await capture(page,"closed-390");
 await trigger.focus();await page.keyboard.press("Enter");await expect(trigger).toHaveAttribute("aria-expanded","true");
 await expect(page.getByRole("dialog",{name:"Navigation principale"})).toBeVisible();
 await expect.poll(()=>page.locator("main").evaluate(node=>(node as HTMLElement).inert)).toBe(true);
 await expect(page.locator("html")).toHaveCSS("overflow","hidden");
 await page.keyboard.press("Tab");await expect(page.getByRole("link",{name:"Actualités",exact:true})).toBeFocused();
 const english=page.getByRole("link",{name:"English",exact:true});await english.focus();await page.keyboard.press("Tab");await expect(page.getByRole("link",{name:/Retour à l’accueil/})).toBeFocused();
 await page.keyboard.press("Shift+Tab");await expect(english).toBeFocused();await settled(page);await capture(page,"open-390");
 const transforms=await trigger.locator("span span").evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).transform));expect(transforms[0]).not.toBe(transforms[1]);expect(transforms.every(value=>value.includes("0.707"))).toBe(true);
 await page.addScriptTag({path:axePath});
 const violations=await page.evaluate(async()=>{
  const axe=(window as unknown as {axe:{run:(selector:string,options:unknown)=>Promise<{violations:unknown[]}>}}).axe;
  return (await axe.run('[role="dialog"]',{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})).violations;
 });expect(violations).toEqual([]);
 await page.keyboard.press("Escape");await expect(trigger).toBeFocused();await expect(page.locator("header")).toHaveAttribute("data-menu-state","closing");
 await capture(page,"closing-390");await expect(nav).toBeHidden();await expect(page.getByRole("dialog")).toHaveCount(0);
 await expect.poll(()=>page.locator("main").evaluate(node=>(node as HTMLElement).inert)).toBe(false);await expect(page.locator("html")).not.toHaveCSS("overflow","hidden");expect(errors).toEqual([]);
});

test("opening and closing can reverse without leaving a scroll lock or hidden links",async({page})=>{
 await visit(page);const trigger=toggle(page);
 await trigger.click();await page.waitForTimeout(120);await capture(page,"opening-390");
 await trigger.click();await page.waitForTimeout(80);await trigger.click();await settled(page);
 await expect(trigger).toHaveAttribute("aria-expanded","true");await expect(page.getByRole("navigation",{name:"Navigation principale"}).getByRole("link")).toHaveCount(6);
 await trigger.click();await expect(page.locator("#site-navigation")).toBeHidden();await expect(page.locator("header")).toHaveAttribute("data-menu-state","closed");
});

test("mobile sizes, landscape, long identity and the inverse header retain usable menus",async({page})=>{
 for(const variant of [{width:320,height:740,story:"long",theme:"projection",locale:"fr"},{width:844,height:390,story:"default",theme:"projection",locale:"fr"},{width:768,height:1024,story:"default",theme:"editorial",locale:"en"},{width:390,height:844,story:"immersive",theme:"projection",locale:"fr"}]){
  await visit(page,variant.width,variant.height,variant.story,variant.theme,variant.locale);
  await toggle(page).click();await settled(page);
  const nav=page.getByRole("navigation",{name:variant.locale==="fr"?"Navigation principale":"Main navigation"});
  await expect(nav.getByRole("link")).toHaveCount(6);for(const link of await nav.getByRole("link").all()){await link.scrollIntoViewIfNeeded();await expect(link).toBeInViewport();}
  await page.getByRole("link",{name:"English",exact:true}).scrollIntoViewIfNeeded();await expect(page.getByRole("link",{name:"English",exact:true})).toBeInViewport();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator("#site-navigation").evaluate(node=>node.scrollTop=0);await capture(page,`open-${variant.width}-${variant.height}-${variant.story}`);
  await page.keyboard.press("Escape");await expect(page.locator("#site-navigation")).toBeHidden();
 }
});

test("reduced motion removes spatial choreography and resizing restores desktop navigation",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await visit(page);await toggle(page).click();await settled(page);
 await expect(page.getByRole("link",{name:"Actualités",exact:true})).toHaveCSS("transform","none");
 await page.keyboard.press("Escape");await expect(page.locator("header")).toHaveAttribute("data-menu-state","closed");
 await page.setViewportSize({width:1440,height:900});await page.locator("[data-catalog-ready]").evaluate(node=>(node as HTMLElement).style.maxWidth="none");await expect(toggle(page)).toBeHidden();
 await expect(page.getByRole("navigation",{name:"Navigation principale"})).toBeVisible();await settled(page);await capture(page,"desktop-1440");
 await page.getByRole("link",{name:"Contact",exact:true}).focus();await page.setViewportSize({width:390,height:844});
 await expect(toggle(page)).toBeFocused();await expect(page.locator("#site-navigation")).toBeHidden();
 await toggle(page).click();await page.setViewportSize({width:1440,height:900});await expect(page.getByRole("navigation",{name:"Navigation principale"})).toBeVisible();
 await expect.poll(()=>page.locator("main").evaluate(node=>(node as HTMLElement).inert)).toBe(false);
});

test("choosing a destination lets the exit finish before leaving the document",async({page})=>{
 await visit(page);await toggle(page).click();await settled(page);
 let requestedAt=0;await page.route("**/contact",async route=>{requestedAt=Date.now();await route.fulfill({status:200,contentType:"text/html",body:"<title>Contact destination</title><main>Contact</main>"});});
 const selectedAt=Date.now();await page.getByRole("link",{name:"Contact",exact:true}).click();
 await expect(page).toHaveTitle("Contact destination");expect(requestedAt-selectedAt).toBeGreaterThanOrEqual(320);
});


test("immersive and burger headers keep the same baseline with different logo proportions",async({page})=>{
 await page.route('**/site-logos/*',async route=>{const white=new URL(route.request().url()).pathname.endsWith('2');await route.fulfill({status:200,contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="${white?1024:892}" height="${white?342:60}" viewBox="0 0 ${white?1024:892} ${white?342:60}"><rect width="100%" height="100%" fill="${white?'white':'black'}"/></svg>`});});
 for(const width of [320,390,440]){
  await visit(page,width,956,'asymmetric-logos');await expect(page.locator('#site-navigation')).toHaveAttribute('inert','');
  await page.locator('header img').evaluateAll(async nodes=>{await Promise.all(nodes.map(n=>(n as HTMLImageElement).decode()));});
  const header=page.locator('header'),trigger=toggle(page),before=await trigger.boundingBox(),headerBefore=await header.boundingBox();
  await trigger.click();await expect(header).toHaveAttribute('data-menu-state','open');await settled(page);await page.locator('header img').evaluateAll(async nodes=>{await Promise.all(nodes.map(n=>(n as HTMLImageElement).decode()));});
  const after=await trigger.boundingBox(),headerAfter=await header.boundingBox();expect(after!.y).toBeCloseTo(before!.y,1);expect(headerAfter!.height).toBeCloseTo(headerBefore!.height,1);expect(headerAfter!.height).toBe(88);
  await page.keyboard.press('Escape');await expect(header).toHaveAttribute('data-menu-state','closed');expect((await trigger.boundingBox())!.y).toBeCloseTo(before!.y,1);
 }
 for(const width of [1280,1440,1920]){
  const measure=()=>page.locator('header').evaluate(n=>{const home=n.querySelector('a')!.getBoundingClientRect(),nav=n.querySelector('nav')!.getBoundingClientRect();return {homeCenter:home.y+home.height/2,navCenter:nav.y+nav.height/2};});
  await visit(page,width,956,'asymmetric-logos');await page.locator('header img').evaluateAll(async nodes=>{await Promise.all(nodes.map(n=>(n as HTMLImageElement).decode()));});const hero=await measure();
  await visit(page,width,956,'asymmetric-logos-default');await page.locator('header img').evaluateAll(async nodes=>{await Promise.all(nodes.map(n=>(n as HTMLImageElement).decode()));});const normal=await measure();
  expect(hero.homeCenter).toBeCloseTo(normal.homeCenter,1);expect(hero.navCenter).toBeCloseTo(normal.navCenter,1);
 }

});


test("burger lines draw the frame before revealing links and reverse without recoloring the header",async({page},info)=>{
 await visit(page,390,844,'asymmetric-logos');
 const header=page.locator('header'),trigger=toggle(page),first=page.getByRole('link',{name:'Actualités',exact:true});
 const appearance=()=>header.evaluate(n=>({color:getComputedStyle(n).color,background:getComputedStyle(n).backgroundColor,logo:n.querySelector('img')?.getAttribute('src')}));
 const before=await appearance();
 await page.evaluate(()=>{const samples:unknown[]=[];Reflect.set(window,'menuSamples',samples);const start=performance.now();const sample=()=>{const root=document.querySelector('header')!,fill=root.querySelector<HTMLElement>('[data-menu-fill]')!,edges=root.querySelectorAll<HTMLElement>('[data-menu-edge]'),content=root.querySelector<HTMLElement>('[data-menu-content]')!;samples.push({stage:(root as HTMLElement).dataset.menuMotion,width:edges[0]!.getBoundingClientRect().width,height:edges[2]!.getBoundingClientRect().height,opacity:Number(getComputedStyle(content).opacity),fillTop:fill.getBoundingClientRect().top});if(performance.now()-start<2200)requestAnimationFrame(sample);};requestAnimationFrame(sample);});
 await trigger.click();await expect(header).toHaveAttribute('data-menu-motion','open');
 expect(await appearance()).toEqual(before);await expect(first).toBeVisible();
 const samples=await page.evaluate(()=>Reflect.get(window,'menuSamples') as {stage:string;width:number;height:number;opacity:number}[]);
 const extending=samples.filter(s=>s.stage==='extending'),descending=samples.filter(s=>s.stage==='descending');
 expect(extending.length).toBeGreaterThan(3);expect(descending.length).toBeGreaterThan(3);
 expect(extending.every(s=>s.height<=8.1&&s.opacity===0)).toBe(true);
 expect(descending.every(s=>Math.abs(s.width-358)<1&&s.opacity===0)).toBe(true);
 await page.screenshot({path:info.outputPath('menu-open.png')});
 await trigger.click();await expect(header).toHaveAttribute('data-menu-motion','descending');expect(await appearance()).toEqual(before);
 await expect(header).toHaveAttribute('data-menu-motion','extending');await expect(page.locator('[data-menu-content]').first()).toHaveCSS('opacity','0');
 await expect(header).toHaveAttribute('data-menu-state','closed');expect(await appearance()).toEqual(before);
 await expect(trigger.locator('span span').first()).toHaveCSS('opacity','1');
});


for(const width of [390,1440])test(`header crossfades between home and inner pages at ${width}px`,async({page},info)=>{
 await page.route('**/site-logos/*',async route=>{const light=new URL(route.request().url()).pathname.endsWith('2');await route.fulfill({status:200,contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="48"><rect width="200" height="48" fill="${light?'white':'black'}"/></svg>`});});
 await visit(page,width,900,'route-transition');const header=page.locator('header'),node=await header.elementHandle(),dark=header.locator('[data-logo-tone="dark"]'),light=header.locator('[data-logo-tone="light"]');
 await expect(header).toHaveAttribute('data-header-appearance','immersive');await expect(light).toHaveCSS('opacity','1');
 await page.getByRole('button',{name:'Changer de page'}).click();await expect(header).toHaveAttribute('data-header-appearance','standard');
 await expect(dark).toHaveCSS('opacity','1');await expect(light).toHaveCSS('opacity','0');await expect(header).toHaveCSS('position','relative');
 expect(await node!.evaluate(n=>n===document.querySelector('header'))).toBe(true);expect(await header.evaluate(n=>n.getAnimations({subtree:true}).length)).toBe(0);
 await page.screenshot({path:info.outputPath(`header-standard-${width}.png`)});
 await page.getByRole('button',{name:'Changer de page'}).click();await expect(header).toHaveAttribute('data-header-appearance','immersive');await expect(light).toHaveCSS('opacity','1');await expect(dark).toHaveCSS('opacity','0');
 await page.getByRole('button',{name:'Changer de page'}).click();await page.getByRole('button',{name:'Changer de page'}).click();await expect(light).toHaveCSS('opacity','1');
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Changer de page'}).click();await expect(dark).toHaveCSS('opacity','1');expect(await header.evaluate(n=>n.getAnimations({subtree:true}).length)).toBe(0);
});
