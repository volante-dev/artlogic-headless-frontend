import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
function fixture(){return JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")) as {sites:{artworkId:string;apiOrigin:string}[]};}
const visibleDialogs=(page:import("@playwright/test").Page)=>page.getByRole("dialog");
test("internal catalogue visit closes to the filtered page and restores the trigger",async({page})=>{
  await page.goto("/artworks?q=demonstration&page=2");
  const trigger=page.getByTestId("artwork-card").first().getByRole("link"),href=await trigger.getAttribute("href");
  await trigger.click();await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"$"));
  await expect(visibleDialogs(page)).toHaveCount(1);await expect(page.getByRole("heading",{level:1})).toBeVisible();
  await page.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true}).click();
  await expect(page).toHaveURL(/\/artworks\?q=demonstration&page=2$/);
  await expect(visibleDialogs(page)).toHaveCount(0);await expect(trigger).toBeFocused();
});
test("direct UUID canonicalizes then closes to the public PLP; reload loses origin",async({page,request})=>{
  const id=fixture().sites[0]!.artworkId;
  const response=await request.get("/artworks/"+id,{maxRedirects:0});expect(response.status()).toBe(308);expect(response.headers()["cache-control"]).toContain("no-store");
  await page.goto("/artworks/"+id);await expect(visibleDialogs(page)).toHaveCount(1);
  await expect(page.getByRole("heading",{level:1})).toBeVisible();await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/artworks$/);await expect(visibleDialogs(page)).toHaveCount(0);
  const first=page.getByTestId("artwork-card").first().getByRole("link"),href=await first.getAttribute("href");
  await first.click();await expect(page).toHaveURL(new RegExp(href!+"$"));await expect(visibleDialogs(page)).toHaveCount(1);await page.reload();
  await page.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true}).click();await expect(page).toHaveURL(/\/artworks$/);
});
test("home and ordinary client anchors share the modal; modified click opens an independent document",async({page,context})=>{
  await page.goto("/");const first=page.getByTestId("artwork-card").first().getByRole("link");await first.click();
  await expect(visibleDialogs(page)).toHaveCount(1);await page.keyboard.press("Escape");await expect(page).toHaveURL(new RegExp("/$"));
  await expect(visibleDialogs(page)).toHaveCount(0);
  const href=await first.getAttribute("href");await page.evaluate(href=>{const a=document.createElement("a");a.href=href!;a.textContent="Synthetic editorial link";document.querySelector("main")!.append(a);},href);
  await page.getByRole("link",{name:"Synthetic editorial link",exact:true}).click();await expect(visibleDialogs(page)).toHaveCount(1);
  await page.keyboard.press("Escape");await expect(visibleDialogs(page)).toHaveCount(0);
  const popup=context.waitForEvent("page");await first.click({modifiers:["ControlOrMeta"]});const next=await popup;await next.waitForLoadState();
  await expect(next.getByRole("dialog")).toHaveCount(1);await next.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true}).click();await expect(next).toHaveURL(/\/artworks$/);await next.close();
});
test("a hidden artwork returns a real, closable 404 document and a Flight tree",async({page,request})=>{
  const hidden="50000000-0000-4000-8000-000000000046";
  const response=await page.goto("/artworks/"+hidden);expect(response?.status()).toBe(404);
  await expect(visibleDialogs(page)).toHaveCount(1);await expect(page.getByText("Cette œuvre n’est plus disponible.",{exact:true})).toBeVisible();
  const flight=await request.get("/artworks/"+hidden,{headers:{RSC:"1"}});expect(flight.status()).toBe(200);expect(flight.headers()["content-type"]).toContain("text/x-component");
  await page.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true}).click();await expect(page).toHaveURL(/\/artworks$/);
});
test("language replaces the current work, retains the actual origin and Forward verifies again",async({page})=>{
  await page.goto("/artworks?q=demonstration&page=2");await page.getByTestId("artwork-card").first().getByRole("link").click();
  await expect(page).toHaveURL(/\/artworks\/[^/?]+$/);await expect(page.getByRole("dialog").getByTestId("artwork-experience")).toBeVisible();
  await page.getByRole("dialog").locator('a[data-artwork-locale="en"]').click();await expect(page).toHaveURL(/\/en\/artworks\/[^/?]+$/);
  await page.getByRole("button",{name:"Close artwork",exact:true}).click();await expect(page).toHaveURL(/\/artworks\?q=demonstration&page=2$/);await expect(page.getByRole("dialog")).toHaveCount(0);await expect(page.getByRole("heading",{name:"Œuvres",exact:true})).toBeVisible();
  await page.goForward();await expect(page).toHaveURL(/\/en\/artworks\/[^/?]+$/);await expect(page.getByRole("dialog").getByTestId("artwork-experience")).toBeVisible();await expect(page.getByRole("button",{name:"Close artwork",exact:true})).toBeVisible();
  await page.keyboard.press("Escape");await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("pending 404 is closable without an artwork history entry or induced back",async({page})=>{
  await page.goto("/");await expect(page.getByTestId("artwork-card").first()).toBeVisible();
  await page.evaluate(()=>{const a=document.createElement("a");a.href="/artworks/50000000-0000-4000-8000-000000000046?returnTo=https://example.test";a.textContent="Synthetic unavailable work";document.querySelector("main")!.append(a);});
  await page.getByRole("link",{name:"Synthetic unavailable work",exact:true}).click();
  await expect(page.getByText("Cette œuvre n’est plus disponible.",{exact:true})).toBeVisible();await expect(page).toHaveURL(/\/$/);
  await page.keyboard.press("Escape");await expect(page.getByRole("dialog")).toHaveCount(0);await expect(page).toHaveURL(/\/$/);
});
test("33 real reachable visits keep their origin after the first visual state is evicted",async({page})=>{
  test.setTimeout(120000);let reads=0;page.on("request",request=>{if(new URL(request.url()).pathname.startsWith("/api/artwork-experiences/"))reads++;});await page.goto("/artworks?pageSize=3#origin-0");
  const first=await page.getByTestId("artwork-card").first().getByRole("link").getAttribute("href"),second=await page.getByTestId("artwork-card").nth(1).getByRole("link").getAttribute("href");
  for(let index=0;index<33;index++){
    if(index%2===0)await page.getByTestId("artwork-card").first().getByRole("link").click();
    else {
      await page.getByRole("dialog").evaluate((node,href)=>{const a=document.createElement("a");a.href=href!;a.textContent="Synthetic next work";node.append(a);},second);
      await page.getByRole("dialog").getByRole("link",{name:"Synthetic next work",exact:true}).click();
    }
    await expect(page).toHaveURL(new RegExp((index%2===0?first:second)+"$"));await expect(page.getByRole("dialog").getByTestId("artwork-experience")).toHaveAttribute("data-enhanced","true");
    await page.getByRole("dialog").evaluate(node=>{node.scrollTop=900;});
    if(index%2===1){
      await page.evaluate(index=>history.pushState(null,"","/artworks?pageSize=3#origin-"+(Math.floor(index/2)+1)),index);
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
  }
  // 33 artwork entries + 17 origins fit Chromium's 50-entry session-history limit.
  const prior=reads;await page.evaluate(()=>history.go(-48));await expect.poll(()=>reads).toBeGreaterThan(prior);await expect(page).toHaveURL(/\/artworks\/[^/?]+$/);
  await expect(page.getByRole("dialog").getByTestId("artwork-experience")).toHaveAttribute("data-enhanced","true");
  await page.keyboard.press("Escape");await expect(page).toHaveURL(/\/artworks\?pageSize=3#origin-0$/);await expect(page.getByRole("dialog")).toHaveCount(0);
});
