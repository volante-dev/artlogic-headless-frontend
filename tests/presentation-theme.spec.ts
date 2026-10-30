import {test,expect} from "@playwright/test";
test("the effective theme is present before hydration and missing fonts retain readable text",async({page})=>{
 const response=await page.goto("/");expect(await response!.text()).toContain("--site-color-background:");await expect(page.getByRole("heading",{level:1})).toBeVisible();
 await page.route("**/fonts/**/*.woff2",route=>route.abort());await page.reload();await expect(page.getByRole("heading",{level:1})).toBeVisible();await expect(page.locator("body")).not.toHaveCSS("visibility","hidden");
});
