import {test,expect} from "@playwright/test";
test("all boilerplate destinations retain explicit content or empty states",async({page})=>{
 for(const locale of ["fr","en"])for(const key of ["news","artworks","exhibitions","publications","expertise","contact"]){await page.goto("/"+locale+"/"+key);await expect(page.getByRole("heading",{level:1})).toBeVisible();await expect(page.getByRole("navigation").first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
