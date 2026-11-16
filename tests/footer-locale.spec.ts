import {test,expect} from "@playwright/test";
test("footer language changes atomically without a document reload",async({page})=>{await page.goto("/");const footer=page.locator("footer");await footer.scrollIntoViewIfNeeded();let reloads=0;page.on("request",r=>{if(r.isNavigationRequest()&&r.frame()===page.mainFrame())reloads++;});await page.locator("header").getByRole("link",{name:"English",exact:true}).click();await expect(footer.getByText("Contact the gallery",{exact:true})).toBeVisible();await expect(footer.getByText("Discover",{exact:true})).toBeVisible();expect(reloads).toBe(0);await page.locator("header").getByRole("link",{name:"Français",exact:true}).click();await expect(footer.getByText("Contacter la galerie",{exact:true})).toBeVisible();});
test("footer credit follows language changes and keeps the contributed studio link",async({page})=>{
 await page.goto("/");const footer=page.locator("footer");await expect(footer.getByText("Réalisé par",{exact:false})).toBeVisible();
 const credit=footer.getByRole("link",{name:"Studio Volante",exact:true});await expect(credit).toHaveAttribute("href","https://studio-volante.fr");await expect(credit).toHaveAttribute("rel","noopener noreferrer");
 let reloads=0;page.on("request",r=>{if(r.isNavigationRequest()&&r.frame()===page.mainFrame())reloads++;});
 await page.locator("header").getByRole("link",{name:"English",exact:true}).click();await expect(footer.getByText("crafted by",{exact:false})).toBeVisible();await expect(footer.getByText("Réalisé par",{exact:false})).toHaveCount(0);
 await page.locator("header").getByRole("link",{name:"Français",exact:true}).click();await expect(footer.getByText("Réalisé par",{exact:false})).toBeVisible();expect(reloads).toBe(0);
});
