import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
const id=()=>JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites[0].artworkId as string;
test("the first view has a white rail; both image edges shrink into the reading column",async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto("/artworks/"+id());
  const scene=page.getByRole("dialog").getByTestId("artwork-experience");await expect(scene).toHaveAttribute("data-enhanced","true");
  const rail=page.getByRole("navigation",{name:"Vues de l’œuvre",exact:true});await expect(rail).toBeVisible();
  await expect(rail.getByRole("button").first()).toHaveAttribute("aria-current","step");
  const frame=scene.getByTestId("artwork-frame"),before=(await frame.boundingBox())!;
  const arrival=await rail.evaluate(node=>getComputedStyle(node).color);
  await page.getByRole("dialog").evaluate(node=>{node.scrollTop=450;});
  await expect.poll(async()=>Number(await scene.getAttribute("data-transition"))).toBeGreaterThan(.45);
  const middle=(await frame.boundingBox())!;expect(middle.x).toBeGreaterThan(before.x);expect(middle.x+middle.width).toBeLessThan(before.x+before.width);
  await page.getByRole("dialog").evaluate(node=>{node.scrollTop=900;});
  await expect.poll(async()=>Number(await scene.getAttribute("data-transition"))).toBe(1);
  const after=(await frame.boundingBox())!;expect(after.x).toBeCloseTo(720,0);expect(after.width).toBeLessThan(720);
  expect(await rail.evaluate(node=>getComputedStyle(node).color)).not.toBe(arrival);
  await rail.getByRole("button").nth(2).click();await expect(rail.getByRole("button").nth(2)).toHaveAttribute("aria-current","step");
  await rail.getByRole("button").first().click();await expect(rail.getByRole("button").first()).toHaveAttribute("aria-current","step");
  await expect(page.locator("[data-artwork-bottom-controls]")).toHaveCount(0);
});
test("reduced motion exposes the full reading and images as a static document",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/artworks/"+id());
  const scene=page.getByRole("dialog").getByTestId("artwork-experience");await expect(scene).toHaveAttribute("data-enhanced","false");
  await expect(scene.locator("[data-static-view]")).toHaveCount(2);
  await expect(page.getByRole("link",{name:"Demander des informations",exact:true})).toHaveCount(1);
  expect(await scene.evaluate(node=>node.getAnimations({subtree:true}).length)).toBe(0);
});
test("zero images omit progression and one image keeps a passive rail",async({page})=>{
  for(const suffix of ["004","002"]){await page.goto("/artworks/50000000-0000-4000-8000-000000000"+suffix);const rail=page.getByRole("navigation",{name:"Vues de l’œuvre",exact:true});if(suffix==="004"){await expect(rail).toHaveCount(0);continue;}await expect(rail).toBeVisible();await expect(rail.getByRole("button")).toHaveCount(0);await expect(rail.locator('[aria-current="step"]')).toHaveCount(1);}
});
