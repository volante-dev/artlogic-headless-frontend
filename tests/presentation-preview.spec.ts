import {test,expect} from "@playwright/test";
test("a copied preview URL or public query never grants draft authority",async({page,request})=>{
 const response=await page.goto("/preview");expect(response?.headers()["cache-control"]).toContain("no-store");await expect(page.locator("iframe")).toHaveCount(0);await expect(page.getByText(/aperçu.*indisponible|aperçu.*expiré/i)).toBeVisible();
 for(const path of ["/preview/session","/preview/assets/11111111-1111-4111-8111-111111111111"]){const r=await request.get(path);expect(r.status()).toBe(401);expect(r.headers()["cache-control"]).toContain("no-store");}
 expect((await request.post("/preview/exchange",{headers:{origin:"https://wrong.example","content-type":"application/x-www-form-urlencoded"},data:"code="+"x".repeat(43)})).status()).toBe(403);
 await page.goto("/?preview=true&draft=true");await expect(page.locator("iframe")).toHaveCount(0);expect(await page.content()).not.toContain("PRIVATE_PREVIEW_SENTINEL");
});
