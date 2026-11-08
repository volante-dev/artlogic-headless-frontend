import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
const artworkId=()=>JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites[0].artworkId as string;
test("the locale relay accepts only configured public projections",async({request})=>{
 for(const query of ["locale=zz&pageKey=home","locale=fr&pageKey=draft","locale=fr&locale=en&pageKey=home","locale=fr&pageKey=home&url=https://example.test","locale=fr&pageKey=home&artwork="]){expect((await request.get("/api/site-locale?"+query)).status()).toBe(400);}
 const response=await request.get("/api/site-locale?locale=en&pageKey=home");expect(response.status()).toBe(200);expect(response.headers()["cache-control"]).toContain("no-store");const value=await response.json();expect(value.locale).toBe("en");expect(value.artwork).toBeNull();expect(value.presentation.pageKey).toBe("home");
 expect((await request.get("/api/site-locale?locale=en&pageKey=artworkDetail&artwork=50000000-0000-4000-8000-000000000046")).status()).toBe(404);
});
test("the header translates the mounted page and preserves the document and video",async({page})=>{
 await page.goto("/");await expect(page.getByRole("heading",{name:"L’art, au premier regard.",exact:true})).toBeVisible();
 const hero=page.locator("video").first(),node=await hero.elementHandle();await page.evaluate(()=>{Object.assign(window,{localeDocumentMarker:"unchanged"});});
 const documents:string[]=[];page.on("request",r=>{if(r.resourceType()==="document")documents.push(r.url());});
 await page.getByRole("navigation",{name:"Langue",exact:true}).getByRole("link",{name:"English",exact:true}).click();
 await expect(page).toHaveURL(url=>url.pathname==="/en");await expect(page.locator("html")).toHaveAttribute("lang","en");await expect(page.getByRole("heading",{name:"Art, at first sight.",exact:true})).toBeVisible();
 expect(await node!.evaluate(n=>n.isConnected)).toBe(true);expect(await page.evaluate(()=>Reflect.get(window,"localeDocumentMarker"))).toBe("unchanged");
 await page.getByRole("navigation",{name:"Language",exact:true}).getByRole("link",{name:"Français",exact:true}).click();await expect(page.getByRole("heading",{name:"L’art, au premier regard.",exact:true})).toBeVisible();expect(documents).toEqual([]);
});
test("artwork translations keep the dialog, slide, zoom and scroll mounted without a loading flash",async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto("/artworks/"+artworkId());
 const dialog=page.getByRole("dialog"),scene=dialog.getByTestId("artwork-experience");await expect(scene).toBeVisible();
 await dialog.getByRole("navigation",{name:"Vues de l’œuvre",exact:true}).getByRole("button").nth(1).click();await expect(scene).toHaveAttribute("data-scroll-motion","idle");
 await scene.locator('[data-view="1"]').getByRole("button",{name:"Agrandir l’image ×2",exact:true}).click();
 const element=await scene.elementHandle(),top=await dialog.evaluate(n=>n.scrollTop),documentRequests:string[]=[];
 page.on("request",r=>{if(r.resourceType()==="document")documentRequests.push(r.url());});
 await dialog.locator('a[data-artwork-locale="en"]').click();await expect(page).toHaveURL(/\/en\/artworks\//);await expect(dialog.getByRole("button",{name:"Close artwork",exact:true})).toBeVisible();
 expect(await element!.evaluate(n=>n.isConnected)).toBe(true);expect(await dialog.evaluate(n=>n.scrollTop)).toBe(top);await expect(scene.locator('[data-view="1"] [data-zoomed="true"]')).toHaveCount(1);await expect(dialog.getByText("Checking availability…",{exact:true})).toHaveCount(0);
 await dialog.locator('a[data-artwork-locale="fr"]').click();await expect(dialog.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true})).toBeVisible();expect(await element!.evaluate(n=>n.isConnected)).toBe(true);expect(documentRequests).toEqual([]);
});
test("locale failures keep the current page visible and a later attempt succeeds",async({page})=>{
 await page.goto("/news");await expect(page.getByRole("heading",{name:"Actualités",exact:true})).toBeVisible();
 const nav=page.getByRole("navigation",{name:"Langue",exact:true});await page.context().setOffline(true);await nav.getByRole("link",{name:"English",exact:true}).click();await expect(nav.getByRole("status")).toBeVisible();await expect(page.getByRole("heading",{name:"Actualités",exact:true})).toBeVisible();await expect(page).toHaveURL(url=>url.pathname==="/news");
 await page.context().setOffline(false);await nav.getByRole("link",{name:"English",exact:true}).click();await expect(page.getByRole("heading",{name:"News",exact:true})).toBeVisible();await expect(page).toHaveURL(url=>url.pathname==="/en/news");
});
