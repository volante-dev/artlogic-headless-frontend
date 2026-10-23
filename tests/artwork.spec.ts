import {test,expect} from "@playwright/test";
import {randomUUID} from "node:crypto";
import {fixture,control} from "./helpers";
test("shows a public artwork with a local image and the supplied information",async({page})=>{
  const art=fixture().published[0]!;await page.goto("/artworks/"+art.id);await expect(page.getByRole("heading",{name:art.title!,exact:true})).toBeVisible();
  await expect(page.getByText(art.artist!,{exact:true})).toBeVisible();const img=page.getByTestId("artwork-image").first();await expect(img).toBeVisible();const src=new URL((await img.getAttribute("src"))!,page.url());expect(src.origin).toBe(new URL(page.url()).origin);expect(src.pathname).toMatch(/^\/media\/[0-9a-f-]{36}$/);
  await expect.poll(()=>img.evaluate(element=>(element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);await expect(page).toHaveTitle(new RegExp(art.title!));
});
test("responds uniformly for hidden and unknown IDs without leaking their metadata",async({page,request})=>{
  for(const id of [fixture().hiddenId,randomUUID()]){const response=await request.get("/artworks/"+id);expect(response.status()).toBe(404);await page.goto("/artworks/"+id);await expect(page.getByRole("heading",{name:"Œuvre introuvable"})).toBeVisible();await expect(page.getByTestId("artwork-image")).toHaveCount(0);}
});
test("replaces an unreadable local image with an accessible placeholder",async({page})=>{
  await page.route("**/media/*",route=>route.fulfill({status:503,body:""}));
  await page.goto("/artworks/"+fixture().published[0]!.id);
  await expect(page.getByText("Image non disponible",{exact:true})).toBeVisible();
  await expect(page.getByTestId("artwork-image")).toHaveCount(0);
});
test("renders absent fields and an image placeholder without fictitious values",async({page,request})=>{
  await control(request,"scenario",{scenario:"missing-fields"});try{await page.goto("/artworks/"+fixture().published[0]!.id);await expect(page.getByRole("heading",{name:"Titre non renseigné"})).toBeVisible();await expect(page.getByText("Image non disponible",{exact:true})).toBeVisible();await expect(page.getByText("Non renseigné",{exact:true})).toHaveCount(4);}
  finally{await control(request,"scenario",{scenario:"baseline"});}
});
test("escapes provider text and never executes active source HTML",async({page,request})=>{
  await control(request,"scenario",{scenario:"active-html"});let dialogs=0;page.on("dialog",async dialog=>{dialogs++;await dialog.dismiss();});
  try{await page.goto("/artworks/"+fixture().published[0]!.id);await expect(page.getByRole("heading",{name:"<script>alert('test')</script>",exact:true})).toBeVisible();expect(dialogs).toBe(0);expect(await page.locator("img[onerror]").count()).toBe(0);}
  finally{await control(request,"scenario",{scenario:"baseline"});}
});
