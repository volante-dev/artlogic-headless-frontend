import {expect,test} from "@playwright/test";
import {control} from "./helpers";
import {presentationFixture} from "./presentation-fixture";

test.beforeEach(async({request})=>{await control(request,"presentation-mode",{mode:"demo"});});
test.afterEach(async({request})=>{await control(request,"presentation-mode",{mode:"demo"});});

for(const width of [375,1440])test("SC-001: fullscreen poster/film and immediate catalogue access at "+width+"px",async({page})=>{
  const data=presentationFixture();await page.setViewportSize({width,height:900});
  // A slow film must not hold the main navigation or useful content hostage.
  await page.route("**/presentation-assets/**",async route=>{const url=new URL(route.request().url());if([data.assets.video,data.assets.mobileVideo].some(path=>url.pathname===path.split("?")[0]))await route.abort();else await route.continue();});
  await page.goto("/");const hero=page.getByTestId("hero-media");await expect(hero).toBeVisible();const box=await hero.boundingBox();expect(box).not.toBeNull();expect(box!.x).toBeCloseTo(0,0);expect(box!.y).toBeCloseTo(0,0);expect(box!.width).toBeCloseTo(width,0);expect(box!.height).toBeGreaterThanOrEqual(899);
  await expect(page.getByRole("heading",{name:data.heading.fr,exact:true})).toBeVisible();
  const poster=hero.locator("video");await expect(poster).toHaveAttribute("poster",data.assets.poster);
  const discover=hero.getByRole("link",{name:data.discoverLabel.fr,exact:true});await expect(discover).toBeVisible();await discover.click();await expect(page).toHaveURL(/\/artworks$/);await expect(page.getByRole("heading",{level:1})).toBeVisible();
});

test("real MP4 playback advances, selects the mobile source and pauses/resumes from the keyboard",async({page})=>{
  const data=presentationFixture();await page.setViewportSize({width:375,height:812});await page.goto("/");
  const video=page.getByTestId("hero-media").locator("video");
  await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>({ready:v.readyState,playing:!v.paused,inline:v.playsInline,muted:v.muted}))).toMatchObject({playing:true,inline:true,muted:true});
  await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(0.1);
  expect(new URL(await video.evaluate((v:HTMLVideoElement)=>v.currentSrc)).pathname).toBe(data.assets.mobileVideo.split("?")[0]);
  const pause=page.getByRole("button",{name:"Mettre le film en pause",exact:true});await pause.focus();await page.keyboard.press("Enter");
  await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);const pausedTime=await video.evaluate((v:HTMLVideoElement)=>v.currentTime);
  // Exercise the visibility event path explicitly; real tab switching is checked separately below.
  await page.evaluate(()=>{Object.defineProperty(document,"visibilityState",{configurable:true,value:"hidden"});document.dispatchEvent(new Event("visibilitychange"));Object.defineProperty(document,"visibilityState",{configurable:true,value:"visible"});document.dispatchEvent(new Event("visibilitychange"));});
  await expect(page.getByRole("button",{name:"Lire le film",exact:true})).toBeFocused();expect(await video.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);expect(await video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeCloseTo(pausedTime,1);
  await page.keyboard.press("Enter");await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(false);
});

test("manual pause survives a background/foreground cycle",async({page,context})=>{
  await page.goto("/");const video=page.getByTestId("hero-media").locator("video");await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(0.1);
  await page.getByRole("button",{name:"Mettre le film en pause",exact:true}).click();
  const other=await context.newPage();await other.goto("about:blank");await other.bringToFront();await page.bringToFront();await other.close();
  expect(await video.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);await expect(page.getByRole("button",{name:"Lire le film",exact:true})).toBeVisible();
});

test("reduced motion starts on the poster with an explicit play action and useful links",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/");const hero=page.getByTestId("hero-media"),video=hero.locator("video");
  await expect(page.getByRole("button",{name:"Lire le film",exact:true})).toBeVisible();expect(await video.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);expect(await video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBe(0);
  await expect(hero.getByRole("link",{name:presentationFixture().discoverLabel.fr,exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Lire le film",exact:true}).click();await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(0.1);
});

test("autoplay refusal keeps the poster and exposes play without blocking the catalogue",async({page})=>{
  await page.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException("Autoplay deliberately refused by browser test","NotAllowedError"));};});
  await page.goto("/");await expect(page.getByRole("button",{name:"Lire le film",exact:true})).toBeVisible();
  const hero=page.getByTestId("hero-media");await expect(hero.locator("video")).toHaveAttribute("poster",presentationFixture().assets.poster);await hero.getByRole("link",{name:presentationFixture().discoverLabel.fr,exact:true}).click();await expect(page).toHaveURL(/\/artworks$/);
});

for(const mode of ["poster-only","no-media"])test("keeps a useful home with "+mode,async({page,request})=>{
  await control(request,"presentation-mode",{mode});await page.goto("/");const hero=page.getByTestId("hero-media");
  await expect(page.getByRole("heading",{level:1})).toBeVisible();await expect(hero.locator("video")).toHaveCount(0);await expect(page.getByRole("button",{name:/Lire le film|Mettre le film en pause/})).toHaveCount(0);
  await hero.getByRole("link",{name:presentationFixture().discoverLabel.fr,exact:true}).click();await expect(page).toHaveURL(/\/artworks$/);
});

test("keeps keyboard controls and navigation usable at 200 percent CSS zoom",async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto("/");await expect(page.getByTestId("hero-media")).toBeVisible();await page.evaluate(()=>{document.documentElement.style.zoom="2";});
  await page.keyboard.press("Tab");await expect(page.getByRole("link",{name:"Aller au contenu"})).toBeFocused();await page.keyboard.press("Enter");await expect(page.locator("main")).toBeFocused();
  const toggle=page.getByRole("button",{name:/^(Lire le film|Mettre le film en pause)$/});await toggle.focus();await expect(toggle).toBeInViewport();await page.keyboard.press("Enter");await expect(toggle).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)).toBe(true);
  const link=page.getByTestId("hero-media").getByRole("link",{name:presentationFixture().discoverLabel.fr,exact:true});await link.focus();await expect(link).toBeInViewport();await page.keyboard.press("Enter");await expect(page).toHaveURL(/\/artworks$/);
});
