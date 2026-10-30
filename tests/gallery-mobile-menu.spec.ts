import {test,expect} from "@playwright/test";
test("mobile menu completes its exit before real document navigation",async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto("/artworks");
 const trigger=page.getByRole("button",{name:"Ouvrir le menu",exact:true});await trigger.click();
 await expect(page.getByRole("dialog",{name:"Navigation principale"})).toBeVisible();
 await expect.poll(()=>page.locator("header").evaluate(node=>node.getAnimations({subtree:true}).length)).toBe(0);
 let requestedAt=0;page.on("request",request=>{if(request.isNavigationRequest()&&new URL(request.url()).pathname==="/contact")requestedAt=Date.now();});
 const clickedAt=Date.now();await page.getByRole("navigation",{name:"Navigation principale",exact:true}).getByRole("link",{name:"Contact",exact:true}).click();
 await expect(page).toHaveURL(/\/contact$/);expect(requestedAt-clickedAt).toBeGreaterThanOrEqual(320);
 await expect(page.locator("header")).toHaveAttribute("data-menu-state","closed");await expect(page.locator("html")).not.toHaveCSS("overflow","hidden");
});
test("mobile language switching closes the sheet and keeps the translated navigation usable",async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto("/news");
 await page.getByRole("button",{name:"Ouvrir le menu",exact:true}).click();
 await page.getByRole("navigation",{name:"Langue",exact:true}).getByRole("link",{name:"English",exact:true}).click();
 await expect(page.locator("html")).toHaveAttribute("lang","en");await expect(page.locator("#site-navigation")).toBeHidden();
 await page.getByRole("button",{name:"Open menu",exact:true}).click();await page.keyboard.press("Tab");
 await expect(page.getByRole("link",{name:"News",exact:true})).toBeFocused();
 await page.keyboard.press("Escape");await expect(page.locator("#site-navigation")).toBeHidden();
 await expect(page.getByRole("button",{name:"Open menu",exact:true})).toBeFocused();
});
