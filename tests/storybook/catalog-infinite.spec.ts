import {test,expect} from "@playwright/test";
import {infiniteCatalogPage} from "../fixtures/infinite-catalog";
test.beforeEach(async({page})=>{
 if(process.env.E2E_STORYBOOK_JSON_COMPAT==="true")await page.route("**/*.ts*",async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/\b(?:assert|with)\s*\{\s*type\s*:\s*["']json["']\s*\}/g,"")});});
 await page.setViewportSize({width:1440,height:900});
});
const url="/iframe.html?id=gallery-artworkmasonrycatalog--infinite&viewMode=story&globals=width:1440";
test("reveals each desktop row from left to right while the next page is appended",async({page})=>{
 await page.route("**/api/artwork-catalog?*",route=>route.fulfill({json:infiniteCatalogPage(2)}));
 await page.goto(url);await expect(page.getByTestId("artwork-card")).toHaveCount(18);
 const cascade=await page.evaluate(async()=>{
  const row=[...document.querySelectorAll<HTMLElement>("[data-artwork-card]")].slice(9,12),samples:number[][]=[];
  scrollTo({top:row[0]!.getBoundingClientRect().top+scrollY-innerHeight+100,behavior:"instant"});
  await new Promise<void>(resolve=>{const started=performance.now();const frame=()=>{samples.push(row.map(node=>Number(getComputedStyle(node).opacity)));if(performance.now()-started<1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
  return {ordered:samples.some(([left,middle,right])=>left!>middle!+.03&&middle!>right!+.03),settled:row.every(node=>getComputedStyle(node).opacity==="1"&&getComputedStyle(node).transform==="none")};
 });
 expect(cascade).toEqual({ordered:true,settled:true});await expect(page.getByTestId("artwork-card")).toHaveCount(36);
});
test("anticipates one page, appends in order without moving existing cards, then stops at the end",async({page})=>{
 const calls:number[]=[];
 await page.route("**/api/artwork-catalog?*",async route=>{const q=new URL(route.request().url()).searchParams;calls.push(Number(q.get("page")));expect(q.get("catalogRevision")).toBe("1");expect(q.get("locale")).toBe("fr");await route.fulfill({json:infiniteCatalogPage(Number(q.get("page")),q.get("q")??"")});});
 await page.goto(url);await expect(page.getByTestId("artwork-card")).toHaveCount(18);expect(calls).toEqual([]);
 const first=page.getByTestId("artwork-card").first(),href=await first.locator("a").getAttribute("href");
 await page.evaluate(()=>{const node=document.querySelector("[data-catalog-continuation]")!;scrollTo(0,node.getBoundingClientRect().top+scrollY-innerHeight-1200);});
 await expect(page.getByTestId("artwork-card")).toHaveCount(36);expect(calls).toEqual([2]);expect(await first.locator("a").getAttribute("href")).toBe(href);
 await expect(page.getByTestId("artwork-card").nth(18).locator("h2")).toHaveText("Étude 19");
 await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await expect(page.getByTestId("artwork-card")).toHaveCount(54);expect(calls).toEqual([2,3]);await expect(page.locator("[data-catalog-continuation]")).toHaveCount(0);
 expect(await page.getByTestId("artwork-card").evaluateAll(nodes=>new Set(nodes.map(node=>node.querySelector("a")!.href)).size)).toBe(54);
});
test("keeps displayed works on failure, retries explicitly and refuses a changed catalogue",async({page})=>{
 let calls=0;await page.route("**/api/artwork-catalog?*",async route=>{calls++;if(calls===1)await route.fulfill({status:503,json:{error:{code:"service_unavailable"}}});else await route.fulfill({json:{...infiniteCatalogPage(2),catalogRevision:2}});});
 await page.goto(url);await expect(page.getByTestId("artwork-card")).toHaveCount(18);await expect(page.locator("[data-catalog-continuation]")).toBeAttached();await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await expect(page.locator("[data-catalog-continuation] a")).toHaveText(/Réessayer/);await expect(page.getByTestId("artwork-card")).toHaveCount(18);expect(calls).toBe(1);
 await page.locator("[data-catalog-continuation] a").click();await expect(page.locator("[data-catalog-continuation] a")).toHaveText(/première page/);await expect(page.getByTestId("artwork-card")).toHaveCount(18);expect(calls).toBe(2);
});
test("restarts after a query change and honours reduced motion",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});const queries:string[]=[];
 await page.route("**/api/artwork-catalog?*",async route=>{const q=new URL(route.request().url()).searchParams;queries.push(q.get("q")??"");await route.fulfill({json:infiniteCatalogPage(Number(q.get("page")),q.get("q")??"")});});
 await page.goto(url);await expect(page.getByTestId("artwork-card")).toHaveCount(18);await expect(page.locator("[data-catalog-continuation]")).toBeAttached();await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await expect(page.getByTestId("artwork-card")).toHaveCount(36);
 await page.getByRole("button",{name:"Autre recherche"}).click();await expect(page.getByTestId("artwork-card")).toHaveCount(18);
 await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await expect(page.getByTestId("artwork-card")).toHaveCount(36);expect(queries).toEqual(["","nouveau"]);
 expect(await page.getByTestId("artwork-card").evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).opacity==="1"&&getComputedStyle(node).transform==="none"))).toBe(true);
});
