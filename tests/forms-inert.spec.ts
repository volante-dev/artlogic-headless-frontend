import {test,expect} from "@playwright/test";
test.skip(!(process.env.E2E_FORMS_RECIPE==="true"&&process.env.E2E_BASE_URL==="http://127.0.0.1:3010"),"Isolated Forms recipe only.");
test("an inert public form creates no session, upload or submission and cannot be reactivated by its child",async({page})=>{
 const requests:string[]=[];page.on("request",request=>{if(request.url().includes("/api/forms/"))requests.push(new URL(request.url()).pathname);});await page.goto("/forms-inert-review");await expect(page.getByText("Aperçu du formulaire — aucun envoi",{exact:true})).toBeVisible();await page.keyboard.press("Tab");await page.keyboard.press("Enter");await page.waitForTimeout(700);expect(requests).toEqual([]);expect(await page.evaluate(()=>Object.keys(sessionStorage).some(key=>key.startsWith("artlogic:forms:")))).toBe(false);expect(await page.locator("form").count()).toBe(0);
});
