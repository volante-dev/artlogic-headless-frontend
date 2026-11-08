import {control} from "./helpers";
import {test,expect} from "@playwright/test";
test.use({trace:"off",screenshot:"off",video:"off"});
test("reports loaded only after actual image load and rejects free-form diagnostics",async({page})=>{
 const events:Record<string,unknown>[]=[];await page.route('**/api/media-observations',async route=>{events.push(route.request().postDataJSON());await route.fulfill({status:204});});
 await page.goto('/artworks');await expect.poll(()=>events.some(e=>e.event==='loaded')).toBe(true);
 for(const event of events){expect(Object.keys(event).sort()).toEqual(['displayId','elapsedMs','event','resourceId','resourceKind','retry']);expect([0,1]).toContain(event.retry);expect(JSON.stringify(event)).not.toMatch(/https?:|X-Amz/);}
});

for(const [name,pattern,status] of [["publication refusal","**/media/*",404],["authorization unavailable","**/media/*",503],["terminal transfer unavailable","**/storage/v1/object/sign/**",503]] as const)test(name+" remains a failure with one retry and no invented HTTP status",async({page})=>{
 const events:Record<string,unknown>[]=[];await page.route('**/api/media-observations',async route=>{events.push(route.request().postDataJSON());await route.fulfill({status:204});});
 if(name==='terminal transfer unavailable')await page.route('**/media/*',route=>route.continue({url:process.env.E2E_CONTROL_URL+'/media025/redirect-unavailable'}));
 else await page.route(pattern,route=>route.fulfill({status,body:''}));await page.goto('/artworks');await expect.poll(()=>events.some(e=>e.event==='retry')).toBe(true);await expect.poll(()=>events.filter(e=>e.event==='failed').length).toBeGreaterThan(1);
 expect(events.filter(e=>e.event==='loaded')).toHaveLength(0);expect(events.every(e=>e.retry===0||e.retry===1)).toBe(true);expect(events.some(e=>'status' in e)).toBe(false);await expect(page.getByRole('main')).toBeVisible();
});
test("an expired terminal grant is recovered by a single fresh authorization",async({page,request})=>{
 const events:Record<string,unknown>[]=[];await page.route('**/api/media-observations',async route=>{events.push(route.request().postDataJSON());await route.fulfill({status:204});});
 await control(request,'media-expired-capability');
 let expired=false;await page.route('**/media/*',async route=>{if(!expired){expired=true;await route.continue({url:process.env.E2E_CONTROL_URL+'/media025/expired'});}else await route.continue();});await page.goto('/artworks');await expect.poll(()=>events.some(e=>e.event==='retry')).toBe(true);await expect.poll(()=>events.some(e=>e.event==='loaded'&&e.retry===1)).toBe(true);expect(events.some(e=>Number(e.retry)>1)).toBe(false);
});

test("real observation requests pass through the locale proxy and return 204",async({page})=>{
 const statuses:number[]=[];
 page.on("response",response=>{if(new URL(response.url()).pathname==="/api/media-observations"&&response.request().method()==="POST")statuses.push(response.status());});
 await page.goto("/artworks");
 await expect.poll(()=>statuses.length).toBeGreaterThan(0);
 expect(statuses.every(status=>status===204)).toBe(true);
});
