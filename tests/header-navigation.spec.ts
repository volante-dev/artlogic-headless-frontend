import {expect,test} from "@playwright/test";
import {readFileSync} from "node:fs";
const pages=[['Actualités','/news'],['Œuvres','/artworks'],['Expositions','/exhibitions'],['Publications','/publications'],["Demande d’expertise",'/expertise'],['Contact','/contact']] as const;
test("shared header links reach all six sections and keep artworks active on detail",async({page})=>{
  for(const [label,path] of pages){
    await page.goto(path);const nav=page.getByRole("navigation",{name:"Navigation principale"});
    await expect(nav.locator('a[aria-current="page"]')).toHaveText(label);
    await expect(page.getByRole("heading",{level:1})).toBeVisible();
    await expect(page.getByRole("link",{name:/Retour à l’accueil/})).toHaveAttribute("href","/");
    if(path!=="/artworks")await expect(page.locator("form")).toHaveCount(0);
  }
  const fixture=JSON.parse(readFileSync(process.env.E2E_FIXTURE_PATH!,"utf8"));
  await page.goto('/artworks/'+fixture.published[0].id);
  // A direct artwork entry intentionally renders only its full-screen dialog.
  await page.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true}).click();
  await expect(page.locator('header a[aria-current="page"]')).toHaveText("Œuvres");
  await page.getByRole("link",{name:/Retour à l’accueil/}).click();await expect(page).toHaveURL(/\/$/);
});
test("compact navigation exposes all destinations and unknown routes keep a usable header",async({page})=>{
  await page.setViewportSize({width:375,height:812});await page.goto('/');
  const toggle=page.getByRole("button",{name:"Ouvrir le menu"});await toggle.click();
  for(const [label,path] of pages)await expect(page.getByRole("navigation",{name:"Navigation principale"}).getByRole("link",{name:label,exact:true})).toHaveAttribute("href",path);
  await page.getByRole("navigation",{name:"Navigation principale"}).getByRole("link",{name:"Contact",exact:true}).click();await expect(page).toHaveURL(/\/contact$/);
  const response=await page.goto('/unknown-destination');expect(response?.status()).toBe(404);await expect(page.getByRole("link",{name:/Retour à l’accueil/})).toBeVisible();
});
