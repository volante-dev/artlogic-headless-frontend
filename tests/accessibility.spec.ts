import {test,expect} from "@playwright/test";
import {fixture} from "./helpers";
for(const width of [375,1440])test("supports keyboard navigation and fits "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:900});await page.goto("/artworks");await expect(page.getByTestId("artwork-card")).toHaveCount(20);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.getByRole("link",{name:/Retour à l’accueil/})).toBeVisible();await page.keyboard.press("Tab");await expect(page.getByRole("link",{name:"Aller au contenu"})).toBeFocused();await page.keyboard.press("Enter");
  await page.goto("/artworks/"+fixture().published[0]!.id);await expect(page.getByTestId("artwork-image").first()).toHaveAttribute("alt",/\S+/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator("h1")).toHaveCount(1);
});
for(const width of [375,1440])test("home and editorial pages remain operable at 200% with reduced motion at "+width,async({page})=>{
  await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:"reduce"});
  for(const path of ["/","/news","/artworks","/artworks/"+fixture().published[0]!.id]){
    await page.goto(path);await expect(page.getByRole("heading",{level:1})).toBeVisible();await page.evaluate(()=>document.documentElement.style.zoom="2");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.keyboard.press("Tab");await expect(page.getByRole("link",{name:"Aller au contenu"})).toBeFocused();await page.keyboard.press("Enter");
    await page.evaluate(()=>document.documentElement.style.zoom="1");
  }
  await page.goto("/");expect(await page.locator("video").evaluate(v=>(v as HTMLVideoElement).paused)).toBe(true);
  const discover=page.getByRole("link",{name:"Découvrir les œuvres",exact:true});await discover.focus();await page.keyboard.press("Enter");await expect(page).toHaveURL(/\/artworks$/);
  const card=page.getByTestId("artwork-card").first().getByRole("link");await card.focus();await page.keyboard.press("Enter");await expect(page.getByTestId("artwork-image").first()).toBeVisible();
});
