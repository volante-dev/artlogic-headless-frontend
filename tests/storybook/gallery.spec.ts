import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
test("a Mac trackpad swipe advances once including inertia, and a fresh swipe works without moving the pointer",async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto("/iframe.html?id=gallery-artworkexperience--arrival&viewMode=story");
 const scene=page.getByTestId("artwork-experience"),dialog=page.getByRole("dialog");await expect(scene).toHaveAttribute("data-enhanced","true");await page.mouse.move(1100,450);
 const {wheelEvents}=JSON.parse(readFileSync(new URL('../../node_modules/wheel-gestures/src/test/fixtures/swipe-up-fast-trackpad.json',import.meta.url),'utf8')) as {wheelEvents:{deltaY:number;timeStamp:number}[]};
 const sign=Math.sign(wheelEvents.find(e=>e.deltaY!==0)!.deltaY);
 const replay=async(direction:number)=>page.evaluate(async({events,direction})=>{
  for(let i=0;i<events.length;i++){
   if(i)await new Promise(resolve=>setTimeout(resolve,Math.max(0,events[i]!.timeStamp-events[i-1]!.timeStamp)));
   const event=new WheelEvent('wheel',{deltaMode:0,deltaY:events[i]!.deltaY*direction,clientX:1100,clientY:450,bubbles:true,cancelable:true});
   // Replay legacy recorded data through the cross-browser fallback, even when
   // this browser exposes a native momentum flag on constructed WheelEvents.
   Object.defineProperty(event,'momentum',{value:undefined});window.dispatchEvent(event);
  }
 },{events:wheelEvents,direction:direction*sign});
 for(const [direction,destination] of [[1,900],[1,1800],[-1,900],[-1,0]]){
  await replay(direction!);await expect(scene).toHaveAttribute("data-scroll-motion","idle");expect(await dialog.evaluate(n=>n.scrollTop)).toBe(destination);
 }
});
test("successive wheel gestures work over a stationary pointer through every image",async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto("/iframe.html?id=gallery-artworkexperience--arrival&viewMode=story");
 const scene=page.getByTestId("artwork-experience"),dialog=page.getByRole("dialog");await expect(scene).toHaveAttribute("data-enhanced","true");
 await page.mouse.move(1100,450);
 for(const [delta,top] of [[8,900],[8,1800],[8,2700],[-8,1800],[-8,900],[-8,0]]){
  await page.mouse.wheel(0,delta!);await expect.poll(()=>dialog.evaluate(n=>n.scrollTop)).toBe(top);await expect(scene).toHaveAttribute("data-scroll-motion","idle");
 }
});
test("images never navigate; explicit zoom pans with mouse and keyboard, then resets for the next view",async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto("/iframe.html?id=gallery-artworkexperience--arrival&viewMode=story");
 const scene=page.getByTestId("artwork-experience"),view=scene.locator('[data-view="0"]'),image=view.locator("img");
 await expect(scene.locator('a[href^="/media/"]')).toHaveCount(0);await expect(scene).toHaveAttribute("data-enhanced","true");
 await view.getByRole("button",{name:"Agrandir l’image ×2",exact:true}).click();await expect(view.locator('[data-zoomed="true"]')).toHaveCount(1);
 await page.mouse.move(1000,350);const first=await image.evaluate(n=>getComputedStyle(n).transform);await page.mouse.move(1250,600);expect(await image.evaluate(n=>getComputedStyle(n).transform)).not.toBe(first);
 if(process.env.E2E_GALLERY_CAPTURE==="1")await page.screenshot({path:`.impeccable/review/gallery/zoom-desktop-${test.info().project.name}.png`});
 const surface=view.getByRole("group");await surface.focus();await page.keyboard.press("ArrowLeft");expect(await image.evaluate(n=>getComputedStyle(n).transform)).not.toBe(first);await expect(scene).toHaveAttribute("data-transition","0");
 await page.keyboard.press("Escape");await expect(page.getByRole("dialog")).toHaveCount(1);await expect(view.getByRole("button")).toHaveAttribute("aria-pressed","false");
 await view.getByRole("button").click();await page.getByRole("navigation",{name:"Vues de l’œuvre",exact:true}).getByRole("button").nth(1).click();await expect(scene).toHaveAttribute("data-scroll-motion","idle");await expect(scene.locator('[data-view="1"]').getByRole("button")).toHaveAttribute("aria-pressed","false");
});
test("compact zoom uses a dedicated examination without duplicated identity",async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.goto("/iframe.html?id=gallery-artworkexperience--arrival&viewMode=story");
 const scene=page.getByTestId("artwork-experience");await expect(scene).toHaveAttribute("data-artwork-layout","mobile");await scene.getByRole("button",{name:"Agrandir l’image ×2",exact:true}).click();await expect(scene).toHaveAttribute("data-mobile-mode","examine");await expect(scene.getByRole("heading",{level:1})).toHaveCount(1);await scene.getByRole("button",{name:"Revenir aux images",exact:true}).click();await expect(scene).toHaveAttribute("data-mobile-mode","gallery");
});
test("title and artist hold their exact position through the full-screen to reading transition",async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto("/iframe.html?id=gallery-artworkexperience--arrival&viewMode=story");await page.evaluate(()=>document.fonts.ready);
 const scene=page.getByTestId("artwork-experience");await expect(scene).toHaveAttribute("data-enhanced","true");await expect.poll(()=>scene.evaluate(n=>n.getAnimations({subtree:true}).length)).toBe(0);
 const heading=scene.locator('[data-artwork-frost] > p').first(),artist=scene.locator('[data-artwork-frost] > p').nth(1),before=(await heading.boundingBox())!,beforeArtist=(await artist.boundingBox())!;
 await page.mouse.move(1100,450);await page.mouse.wheel(0,8);await expect(scene).toHaveAttribute("data-scroll-motion","idle");await expect(scene).toHaveAttribute("data-transition","1");
 const after=(await scene.locator('[data-artwork-title]').boundingBox())!,afterArtist=(await scene.locator('[data-artwork-artist]').boundingBox())!;
 for(const key of ["x","y","width","height"] as const){expect(after[key]).toBeCloseTo(before[key],0);expect(afterArtist[key]).toBeCloseTo(beforeArtist[key],0);}
});
test("a small scroll triggers a complete timed step, ignores momentum and reverses completely",async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto("/iframe.html?id=gallery-artworkexperience--arrival&viewMode=story");
 const dialog=page.getByRole("dialog"),scene=dialog.getByTestId("artwork-experience"),rail=dialog.getByRole("navigation",{name:"Vues de l’œuvre",exact:true});
 await expect(scene).toHaveAttribute("data-enhanced","true");await expect(scene).toHaveAttribute("data-transition","0");await page.mouse.move(1100,450);
 await page.mouse.wheel(0,8);await expect(scene).toHaveAttribute("data-scroll-motion","running");
 await page.mouse.wheel(0,-4);await page.mouse.wheel(0,500);
 await expect(scene).toHaveAttribute("data-scroll-motion","idle");await expect(scene).toHaveAttribute("data-transition","1");expect(await dialog.evaluate(n=>n.scrollTop)).toBe(900);
 await page.mouse.wheel(0,8);await expect(rail.getByRole("button").nth(1)).toHaveAttribute("aria-current","step");await expect(scene).toHaveAttribute("data-scroll-motion","idle");expect(await dialog.evaluate(n=>n.scrollTop)).toBe(1800);
 await page.mouse.wheel(0,-8);await expect(scene).toHaveAttribute("data-scroll-motion","idle");await expect.poll(()=>dialog.evaluate(n=>n.scrollTop)).toBe(900);
 await page.mouse.wheel(0,-8);await expect.poll(()=>dialog.evaluate(n=>n.scrollTop)).toBe(0);await expect(scene).toHaveAttribute("data-transition","0");
 await page.keyboard.press("Escape");await expect(dialog).toHaveCount(0);
});
test("a restored position between steps completes, while long reading keeps native scrolling",async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto("/iframe.html?id=gallery-artworkexperience--arrival&viewMode=story");
 const dialog=page.getByRole("dialog"),scene=dialog.getByTestId("artwork-experience");await expect(scene).toHaveAttribute("data-enhanced","true");await dialog.evaluate(n=>{n.scrollTop=300;});await expect.poll(()=>dialog.evaluate(n=>n.scrollTop)).toBe(900);
 await page.goto("/iframe.html?id=gallery-artworkexperience--long-description&viewMode=story");await expect(scene).toHaveAttribute("data-transition","1");await page.mouse.move(200,450);await page.mouse.wheel(0,120);await expect.poll(()=>dialog.evaluate(n=>n.scrollTop)).toBeGreaterThan(900);await expect(scene).toHaveAttribute("data-scroll-motion","idle");
});
test("the real gallery views work offline, with inert contact and controlled navigation",async({page,baseURL})=>{
  const unexpected:string[]=[];await page.route("**/*",async route=>{const url=new URL(route.request().url());if(url.origin!==baseURL||/^\/(api|v1|auth|preview)\//.test(url.pathname)){unexpected.push(url.pathname);await route.abort();}else await route.continue();});
  await page.setViewportSize({width:1440,height:900});await page.goto("/iframe.html?id=gallery-artworkexperience--arrival&viewMode=story");
  const dialog=page.getByRole("dialog"),rail=dialog.getByRole("navigation",{name:"Vues de l’œuvre",exact:true});
  await expect(dialog.getByTestId("artwork-experience")).toHaveAttribute("data-enhanced","true");await expect(rail.getByRole("button").first()).toHaveAttribute("aria-current","step");
  await rail.getByRole("button").nth(2).click();await expect(rail.getByRole("button").nth(2)).toHaveAttribute("aria-current","step");
  const before=page.url();await dialog.getByRole("link",{name:"Demander des informations",exact:true}).dispatchEvent("click");await expect(page).toHaveURL(before);
  await dialog.locator('a[data-artwork-locale="en"]').click();await expect(dialog.getByRole("button",{name:"Close artwork",exact:true})).toBeVisible();
  await page.keyboard.press("Escape");await expect(dialog).toHaveCount(0);await page.getByRole("button",{name:"Open demonstration artwork",exact:true}).click();await expect(dialog).toHaveCount(1);
  expect(unexpected).toEqual([]);
});
test("standalone progress has real destinations and no fake next view",async({page})=>{
  await page.goto("/iframe.html?id=gallery-artworkprogress--on-image&viewMode=story");await page.getByRole("button",{name:/Vue 3 sur 3/}).click();await expect(page.getByRole("button",{name:/Vue 3 sur 3/})).toHaveAttribute("aria-current","step");
  await page.goto("/iframe.html?id=gallery-artworkprogress--one-view&viewMode=story");await expect(page.getByRole("button")).toHaveCount(0);await expect(page.locator('[aria-current="step"]')).toHaveCount(1);
});
test("reduced motion and a long description retain every view and the contact action",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});await page.setViewportSize({width:375,height:812});await page.goto("/iframe.html?id=gallery-artworkexperience--long-description&viewMode=story");
  const dialog=page.getByRole("dialog");await expect(dialog.getByTestId("artwork-experience")).toHaveAttribute("data-artwork-layout","mobile");
  await dialog.getByRole("button",{name:"Voir les informations",exact:true}).click();
  expect(await dialog.evaluate(node=>node.scrollWidth<=node.clientWidth)).toBe(true);
  await dialog.getByRole("link",{name:"Demander des informations",exact:true}).scrollIntoViewIfNeeded();await expect(dialog.getByRole("link",{name:"Demander des informations",exact:true})).toBeVisible();
  expect(await dialog.evaluate(node=>node.getAnimations({subtree:true}).length)).toBe(0);
});
