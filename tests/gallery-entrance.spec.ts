import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
test("direct and internal arrivals share one bounded entrance with an immediately active close control",async({page})=>{
  const id=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites[0].artworkId;
  for(const mode of ["direct","internal"]){
    if(mode==="direct")await page.goto("/artworks/"+id);else{await page.goto("/artworks");await page.getByTestId("artwork-card").first().getByRole("link").click();}
    await expect(page.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true})).toBeEnabled();
    const scene=page.getByRole("dialog").getByTestId("artwork-experience");await expect(scene).toBeVisible();
    expect(await scene.getAttribute("data-entrance-duration")).toBe("1720");
    await expect(scene).toHaveAttribute("data-artwork-opening-phase","complete");
    await expect.poll(()=>scene.evaluate(node=>node.getAnimations({subtree:true}).length)).toBe(0);
    await page.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true}).click();await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});
test("slow media keep a silent loader and failed media reveal a usable fallback",async({page})=>{
 const id=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites[0].artworkId;
 let release:()=>void=()=>{};const waiting=new Promise<void>(resolve=>{release=resolve;});
 await page.route("**/media/*",async route=>{await waiting;await route.abort("failed");});
 try{
  await page.goto("/artworks/"+id,{waitUntil:"domcontentloaded"});await expect(page.locator("[data-artwork-loading]")).toBeVisible();await expect(page.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true})).toBeEnabled();
  await page.keyboard.press("Escape");await expect(page.getByRole("dialog")).toHaveCount(0);
  release();await page.goto("/artworks/"+id);await expect(page.getByRole("dialog").getByText("Image non disponible",{exact:false}).first()).toBeVisible();await expect(page.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true})).toBeEnabled();
 }finally{release();}
});
