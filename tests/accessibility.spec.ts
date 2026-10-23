import {test,expect} from "@playwright/test";
import {fixture} from "./helpers";
for(const width of [375,1440])test("supports keyboard navigation and fits "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:900});await page.goto("/");await expect(page.getByTestId("artwork-card")).toHaveCount(20);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.keyboard.press("Tab");await expect(page.getByRole("link",{name:"Aller au contenu"})).toBeFocused();await page.keyboard.press("Enter");
  await page.goto("/artworks/"+fixture().published[0]!.id);await expect(page.getByTestId("artwork-image").first()).toHaveAttribute("alt",/\S+/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator("h1")).toHaveCount(1);
});
