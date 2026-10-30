import {test,expect} from "@playwright/test";
test("public queries and copied artwork preview paths grant no draft access",async({page,request})=>{
 const path="/preview/render/fr/artworks/50000000-0000-4000-8000-000000000001";
 await page.goto(path);await expect(page.getByRole("heading",{name:"Aperçu indisponible ou expiré"})).toBeVisible();await expect(page.getByTestId("artwork-experience")).toHaveCount(0);
 expect((await request.get("/preview/session")).status()).toBe(401);
 await page.goto("/artworks/50000000-0000-4000-8000-000000000001?preview=true&draft=true");await expect(page.getByTestId("artwork-experience")).toBeVisible();expect(await page.content()).not.toContain("PRIVATE_PREVIEW_SENTINEL");
});
