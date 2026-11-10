import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
const artwork=()=>JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites[0].artworkId as string;
for(const viewport of [{width:375,height:812},{width:1440,height:600},{width:720,height:450}])test(`responsive reading and modal keyboard focus at ${viewport.width}x${viewport.height}`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto("/artworks/"+artwork());const scene=page.getByRole("dialog").getByTestId("artwork-experience");if(viewport.width<768)await expect(scene).toHaveAttribute("data-artwork-layout","mobile");else await expect(scene).toHaveAttribute("data-enhanced","false");await expect(scene).toHaveAttribute("data-artwork-opening-phase","complete");
  await expect(page.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true})).toBeVisible();
  expect(await page.getByRole("dialog").evaluate(node=>node.scrollWidth<=node.clientWidth)).toBe(true);
  for(let i=0;i<15;i++){await page.keyboard.press("Tab");expect(await page.evaluate(()=>Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);}
  if(viewport.width<768)await scene.getByRole("button",{name:"Voir les informations",exact:true}).click();
  await page.getByRole("link",{name:"Demander des informations",exact:true}).scrollIntoViewIfNeeded();await expect(page.getByRole("link",{name:"Demander des informations",exact:true})).toBeVisible();
  if(viewport.width<768){await page.keyboard.press("Escape");await expect(scene).toHaveAttribute("data-mobile-mode","gallery");}
  await page.keyboard.press("Escape");await expect(page).toHaveURL(/\/artworks$/);await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("changing motion preference while reading immediately exposes the static ordered views",async({page})=>{
  await page.goto("/artworks/"+artwork());const scene=page.getByRole("dialog").getByTestId("artwork-experience");await expect(scene).toHaveAttribute("data-enhanced","true");
  await page.emulateMedia({reducedMotion:"reduce"});await expect(scene).toHaveAttribute("data-enhanced","false");
  await expect(scene.locator("[data-static-view]").first()).toBeVisible();await expect.poll(()=>scene.evaluate(node=>node.getAnimations({subtree:true}).length)).toBe(0);
});
