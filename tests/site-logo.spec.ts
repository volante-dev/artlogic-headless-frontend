import {test,expect} from "@playwright/test";
test("a failed logo falls back to the configured name",async({page,request})=>{
 // The isolated fixture control publishes a synthetic logo via the authenticated backend.
 const {control,fixture}=await import("./helpers");await control(request,"logo");
 try{await page.route("**/site-logos/*",route=>route.fulfill({status:503,body:""}));await page.goto("/");await expect(page.getByRole("link",{name:/Retour à l’accueil/})).toContainText(fixture().siteName);await expect(page.getByTestId("site-logo")).toHaveCount(0);}
 finally{await control(request,"remove-logo");}
});
