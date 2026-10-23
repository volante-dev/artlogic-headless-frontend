import {test,expect} from "@playwright/test";
import {fixture,control} from "./helpers";
test("removes new page, metadata and media reads after hiding, including browser back",async({page,request})=>{
  const art=fixture().published[0]!;await page.goto("/artworks/"+art.id);await expect(page.getByRole("heading",{name:art.title!,exact:true})).toBeVisible();const media=await page.getByTestId("artwork-image").first().getAttribute("src");
  await page.getByRole("link",{name:"Toutes les œuvres"}).click();const start=Date.now();await control(request,"hide",{id:art.id});
  try{
    const html=await request.get("/artworks/"+art.id);expect(html.status()).toBe(404);expect(html.headers()["cache-control"]).toContain("no-store");expect(await html.text()).not.toContain(art.title!);
    const image=await request.get(media!,{headers:{"If-None-Match":"*",Range:"bytes=0-9"}});expect(image.status()).toBe(404);expect(image.headers()["cache-control"]).toContain("no-store");
    await page.goBack();await expect(page.getByRole("heading",{name:"Œuvre introuvable"})).toBeVisible();await expect(page).not.toHaveTitle(new RegExp(art.title!));expect(Date.now()-start).toBeLessThan(60000);
  }finally{await control(request,"publish",{id:art.id});}
});
test("keeps a source withdrawal and return hidden until a new editorial decision",async({page,request})=>{
  const art=fixture().published[0]!;await control(request,"scenario",{scenario:"withdrawal"});
  try{await page.goto("/artworks/"+art.id);await expect(page.getByRole("heading",{name:"Œuvre introuvable"})).toBeVisible();await control(request,"scenario",{scenario:"return"});await page.reload();await expect(page.getByRole("heading",{name:"Œuvre introuvable"})).toBeVisible();}
  finally{await control(request,"scenario",{scenario:"baseline"});await control(request,"restore-selection");}
});
