import {test,expect} from "@playwright/test";
import {mkdir} from "node:fs/promises";

for(const width of [390,1440])test(`opening keeps one progressive backdrop through route handoffs at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});
 await page.goto("/artworks");
 // Leave time to observe the pending shell as well as the canonical/fresh shell.
 await page.route("**/api/artwork-experiences/**",async route=>{
  await new Promise(resolve=>setTimeout(resolve,250));await route.continue();
 });
 await page.evaluate(()=>{
  const samples:{blur:number;opacity:number;same:boolean;visible:boolean;mui:number}[]=[];
  let first:Element|null=null,running=true;
  const frame=()=>{
   const node=document.querySelector<HTMLElement>("[data-artwork-backdrop]");
   const visible=Boolean(node&&!node.hidden);
   if(visible&&!first)first=node;
   if(first&&node){const css=getComputedStyle(node);samples.push({blur:parseFloat(getComputedStyle(document.querySelector("[data-artwork-background]")!).filter.replace("blur(","")),opacity:Number(css.opacity),same:node===first,visible,mui:document.querySelectorAll(".MuiBackdrop-root").length});}
   if(running)requestAnimationFrame(frame);
  };
  Object.assign(window,{openingSamples:samples,stopOpeningSamples:()=>{running=false;}});requestAnimationFrame(frame);
 });
 await page.getByTestId("artwork-card").first().getByRole("link").click();
 const backdrop=page.locator("[data-artwork-backdrop]");
 if(process.env.E2E_GALLERY_CAPTURE==="1"){
  await mkdir(".impeccable/review/opening",{recursive:true});
  await page.screenshot({path:`.impeccable/review/opening/pending-${width}-${test.info().project.name}.png`,scale:"css"});
 }
 await expect(page.getByRole("dialog").getByTestId("artwork-experience")).toHaveAttribute("data-artwork-opening-phase","complete");
 if(process.env.E2E_GALLERY_CAPTURE==="1")await page.screenshot({path:`.impeccable/review/opening/complete-${width}-${test.info().project.name}.png`,scale:"css"});
 const samples=await page.evaluate(()=>{
  const probe=window as unknown as {openingSamples:{blur:number;opacity:number;same:boolean;visible:boolean;mui:number}[];stopOpeningSamples:()=>void};
  probe.stopOpeningSamples();return probe.openingSamples;
 });
 expect(samples.length).toBeGreaterThan(10);
 expect(samples.every(s=>s.same&&s.visible&&s.mui===0)).toBe(true);
 expect(samples.some(s=>s.blur>0&&s.blur<7.9)).toBe(true);
 for(let i=1;i<samples.length;i++){
  expect(samples[i].blur).toBeGreaterThanOrEqual(samples[i-1].blur-.05);
  expect(samples[i].opacity).toBeGreaterThanOrEqual(samples[i-1].opacity-.01);
 }
 await expect(backdrop).toHaveCSS("opacity","1");
 await expect(page.locator("[data-artwork-background]")).toHaveCSS("filter","blur(8px)");
 await page.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true}).click();
 await expect(page.getByRole("dialog")).toHaveCount(0);
 await expect(backdrop).toBeHidden();
 // A subsequent visit has its own entrance and leaves the close control usable.
 await page.getByTestId("artwork-card").first().getByRole("link").click();
 await expect(backdrop).toBeVisible();
 await expect(page.getByRole("dialog").getByTestId("artwork-experience")).toHaveAttribute("data-artwork-opening-phase","complete");
 await page.keyboard.press("Escape");await expect(backdrop).toBeHidden();
});

test("reduced motion keeps the single backdrop and immediate close control",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/artworks");
 await page.getByTestId("artwork-card").first().getByRole("link").click();
 await expect(page.getByRole("dialog").getByTestId("artwork-experience")).toHaveAttribute("data-artwork-opening-phase","complete");
 await expect(page.locator("[data-artwork-background]")).toHaveCSS("filter","blur(8px)");
 await expect(page.locator(".MuiBackdrop-root")).toHaveCount(0);
 await page.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true}).click();
 await expect(page.locator("[data-artwork-backdrop]")).toBeHidden();
});
