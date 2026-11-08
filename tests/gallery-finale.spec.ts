import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
const sites=()=>JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites as {finaleArtworkIds?:string[]}[];
test("a terminal presentation stage keeps photo cardinality and updates its marker immediately",async({page})=>{
 test.setTimeout(120000);const ids=sites()[0].finaleArtworkIds;test.skip(!ids,"Requires --finale fixtures");
 for(const [i,id]of ids!.entries()){
  await page.goto("/artworks/"+id);const conclusion=page.getByRole("button",{name:/^Conclusion$/});await expect(conclusion).toBeVisible();
  const mediaCount=[0,1,2,5,12][i];
  const image=page.locator('[data-artwork-entry-media] img').first(),before=await image.count()?await image.boundingBox():null;
  await conclusion.click();await expect(conclusion).toHaveAttribute("aria-current","step");
  await expect(page.locator('[data-finale-reading]')).toBeVisible();
  const cards=page.locator('[data-finale-card]');expect(await cards.count()).toBeLessThanOrEqual(Math.min(mediaCount,5));
  const mediaIds=await cards.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-media-id')));expect(new Set(mediaIds).size).toBe(mediaIds.length);
  await expect(page.getByRole('button',{name:'Revoir les photographies'})).toHaveCount(0);
  if(before)expect(before.width).toBeGreaterThan(0);
 }
});
test("the front photo stays continuous on the first frame",async({page})=>{
 const ids=sites()[0].finaleArtworkIds;test.skip(!ids,"Requires --finale fixtures");await page.goto('/artworks/'+ids![3]);
 await expect(page.getByTestId('artwork-experience')).toHaveAttribute('data-artwork-opening-phase','complete');
 // Capture both rectangles in one frame to detect real layout jumps rather than CSS intent.
 await page.evaluate(()=>{const frame=document.querySelector('[data-artwork-entry-media] img');(window as unknown as {finaleBefore:DOMRect|null}).finaleBefore=frame?.getBoundingClientRect()??null;});
 await page.getByRole('button',{name:/^Conclusion$/}).click();await expect(page.locator('[data-finale-card][data-front="true"]')).toHaveCount(1);
 const result=await page.evaluate(()=>{const before=(window as unknown as {finaleBefore:DOMRect|null}).finaleBefore,front=document.querySelector('[data-finale-card][data-front="true"] img')?.getBoundingClientRect();return {before,front};});
 expect(result.before).toBeTruthy();expect(result.front).toBeTruthy();for(const key of ["x","y","width","height"] as const)expect(Math.abs(result.front![key]-result.before![key])).toBeLessThanOrEqual(2);
 // Full per-frame pixel/rectangle trajectory is measured by the navigation/performance suites.
});
