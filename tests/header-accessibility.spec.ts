import {control} from "./helpers";
import {test,expect} from "@playwright/test";
for(const width of [375,1440])test("header keyboard, skip link and language at "+width+"px",async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto("/news");const home=page.getByRole("link",{name:/Retour à l’accueil/});await expect(home).toBeVisible();
 await page.keyboard.press("Tab");await expect(page.getByRole("link",{name:"Aller au contenu"})).toBeFocused();await page.keyboard.press("Enter");await expect(page.locator("main")).toBeFocused();
 await home.focus();await page.keyboard.press("Tab");
 if(width===375){
  const toggle=page.getByRole("button",{name:"Ouvrir le menu"});await expect(toggle).toBeFocused();await expect(page.locator("#site-navigation")).toBeHidden();await page.keyboard.press("Enter");await expect(page.getByRole("button",{name:"Fermer le menu"})).toHaveAttribute("aria-expanded","true");await page.keyboard.press("Tab");await expect(page.getByRole("link",{name:"Actualités",exact:true})).toBeFocused();await page.keyboard.press("Escape");await expect(toggle).toBeFocused();await expect(page.locator("#site-navigation")).toBeHidden();await page.keyboard.press("Enter");
 }
 const english=page.getByRole("navigation",{name:"Langue",exact:true}).getByRole("link",{name:"English",exact:true});await english.focus();await page.keyboard.press("Enter");await expect(page.locator("html")).toHaveAttribute("lang","en");
 if(width===375)await expect(page.locator("#site-navigation")).toBeHidden();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(page.getByRole("link",{name:/Back to home/})).toBeVisible();await expect(page.getByRole("heading",{name:"News",exact:true})).toBeVisible();await page.evaluate(()=>scrollTo(0,0));if(width===375)await page.getByRole("button",{name:"Open menu"}).click();await page.screenshot({path:"test-results/header-"+width+".png"});
});
test("resizing a focused desktop navigation to compact restores a visible focus target",async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto("/news");await page.getByRole("navigation",{name:"Navigation principale"}).getByRole("link",{name:"Contact",exact:true}).focus();await page.setViewportSize({width:375,height:900});await expect(page.getByRole("button",{name:"Ouvrir le menu"})).toBeFocused();
 await page.getByRole("button",{name:"Ouvrir le menu"}).click();await page.setViewportSize({width:1440,height:900});await page.setViewportSize({width:375,height:900});await expect(page.locator("#site-navigation")).toBeHidden();
});

test("maximum-length labels remain reachable without horizontal overflow",async({page,request})=>{
 await control(request,"long-labels");try{for(const width of [375,1440]){await page.setViewportSize({width,height:900});await page.goto("/news");await expect(page.getByRole("link",{name:/Retour à l’accueil/})).toBeVisible();if(width===375)await page.getByRole("button",{name:/Ouvrir le menu/}).click();const nav=page.getByRole("navigation",{name:/Navigation principale/});await expect(nav.getByRole("link")).toHaveCount(6);for(const link of await nav.getByRole("link").all())await expect(link).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}}
 finally{await control(request,"reset-labels");}
});
