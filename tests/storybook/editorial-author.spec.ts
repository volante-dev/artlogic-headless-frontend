import {test,expect} from "@playwright/test";
test("only complete profiles open, remain persistent and return focus on close at both sizes",async({page})=>{
 for(const width of [375,1440]){
  await page.setViewportSize({width,height:900});for(const state of ["name-only","name-and-link","name-and-portrait","name-and-bio"]){await page.goto(`/iframe.html?id=editorial-authorprofile--${state}&viewMode=story`);await expect(page.getByText("Camille — auteur de démonstration",{exact:true})).toBeVisible();await expect(page.getByRole("button",{name:"Camille — auteur de démonstration"})).toHaveCount(0);}
  await page.goto("/iframe.html?id=editorial-authorprofile--complete&viewMode=story");const trigger=page.getByRole("button",{name:"Camille — auteur de démonstration"});await trigger.click();const dialog=page.getByRole("dialog");await expect(dialog).toBeVisible();await expect(dialog.getByRole("heading",{name:"Camille — auteur de démonstration"})).toBeVisible();await expect(dialog.getByRole("link")).toHaveAttribute("href","https://example.test/author");await page.keyboard.press("Escape");await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();await trigger.click();await dialog.getByRole("button",{name:"Fermer",exact:true}).click();await expect(trigger).toBeFocused();
 }
});
