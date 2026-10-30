import {test,expect} from "@playwright/test";
import {fixture,control} from "./helpers";
test("language links preserve eight destinations and fragments without browser preferences",async({page})=>{
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  for(const path of ["/","/news","/artworks","/exhibitions","/publications","/expertise","/contact","/artworks/"+fixture().published[0].id]){
    await page.goto(path+"#contenu");await page.getByRole("navigation",{name:"Langue",exact:true}).getByRole("link",{name:"English",exact:true}).click();
    await expect(page).toHaveURL(new RegExp('/en'+(path==="/"?"":path)+'#contenu$'));await expect(page.locator("html")).toHaveAttribute("lang","en");
    await page.getByRole("navigation",{name:"Language",exact:true}).getByRole("link",{name:"Français",exact:true}).click();await expect(page.locator("html")).toHaveAttribute("lang","fr");
  }
  expect(errors).toEqual([]);
});
test("English pages, error documents, canonical redirects and private artwork use the same visibility policy",async({page,request})=>{
  await page.goto("/en/news");await expect(page).toHaveTitle(/News/);await expect(page.getByText("No news at the moment.")).toBeVisible();
  const redirect=await request.get("/fr/news?cursor=kept",{maxRedirects:0});expect(redirect.status()).toBe(308);expect(redirect.headers().location).toMatch(/\/news\?cursor=kept$/);
  for(const path of ["/en/unknown","/en/artworks/"+fixture().hiddenId]){expect((await page.goto(path))?.status()).toBe(404);await expect(page.locator("html")).toHaveAttribute("lang","en");expect((await request.get(path,{headers:{RSC:"1"}})).status()).toBe(404);}
  expect((await request.get("/media/"+fixture().hiddenMediaId)).status()).toBe(404);
  await page.goto("/en/artworks/"+fixture().published[0].id);await expect(page.getByRole("link",{name:"All artworks",exact:true})).toHaveAttribute("href","/en/artworks");await expect(page.getByText("Artist",{exact:true})).toBeVisible();
  await control(request,"hide",{id:fixture().published[0].id});try{expect((await page.reload())?.status()).toBe(404);await expect(page.getByRole("heading",{name:"Artwork not found"})).toBeVisible();}finally{await control(request,"publish",{id:fixture().published[0].id});}
});
test("language switch preserves a valid cursor and explains its expiry",async({page,request})=>{
  const data=fixture(),result=await request.get(data.backendOrigin+"/v1/public/artworks?limit=1"),cursor=(await result.json()).nextCursor;
  expect(cursor).toBeTruthy();await page.goto("/artworks?cursor="+encodeURIComponent(cursor)+"#contenu");
  await page.getByRole("navigation",{name:"Langue",exact:true}).getByRole("link",{name:"English"}).click();
  expect(new URL(page.url()).searchParams.get("cursor")).toBe(cursor);expect(new URL(page.url()).hash).toBe("#contenu");
  await control(request,"hide",{id:data.published[0].id});
  try{await page.getByRole("navigation",{name:"Language",exact:true}).getByRole("link",{name:"Français"}).click();await expect(page.getByText("La sélection a changé. Le catalogue reprend à la première page.")).toBeVisible();}
  finally{await control(request,"publish",{id:data.published[0].id});}
});
test("URL locale wins over language headers and cookies",async({browser})=>{
  const context=await browser.newContext({locale:"en-US"});try{const page=await context.newPage();const origin=process.env.E2E_BASE_URL!;await context.addCookies([{name:"NEXT_LOCALE",value:"en",url:origin}]);await page.goto(origin+"/news");await expect(page.locator("html")).toHaveAttribute("lang","fr");await expect(page.getByRole("heading",{name:"Actualités"})).toBeVisible();}finally{await context.close();}
});
