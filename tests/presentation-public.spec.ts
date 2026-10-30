import {expect,test} from "@playwright/test";
import {builtinFonts} from "../branding/font-catalog";
import {control,fixture} from "./helpers";
import {presentationFixture} from "./presentation-fixture";

test.beforeEach(async({request})=>{await control(request,"presentation-mode",{mode:"demo"});});
test.afterEach(async({request})=>{await control(request,"presentation-mode",{mode:"demo"});});

test("ships the effective theme and content in the first document without a client presentation fetch",async({browser,baseURL,request,page})=>{
  const data=presentationFixture(),html=await request.get("/");expect(html.status()).toBe(200);expect(html.headers()["cache-control"]).toContain("no-store");expect(await html.text()).toContain(data.heading.fr);
  const context=await browser.newContext({javaScriptEnabled:false,baseURL});try{
    const staticPage=await context.newPage();await staticPage.goto("/");
    // React's streamed Suspense fragment needs its bootstrap script to become visible.
    // FR-027 requires the effective theme in server HTML, not a separate no-JS application.
    await expect(staticPage.getByRole("heading",{name:data.heading.fr,exact:true,includeHidden:true})).toBeAttached();
    const rgb="rgb("+[1,3,5].map(i=>parseInt(data.background.slice(i,i+2),16)).join(", ")+")";
    expect(await staticPage.locator("body").evaluate(node=>getComputedStyle(node).backgroundColor)).toBe(rgb);
  }finally{await context.close();}
  const jsonFetches:string[]=[];page.on("request",r=>{if(["fetch","xhr"].includes(r.resourceType())&&/\/presentation(?:\?|$)/.test(new URL(r.url()).pathname))jsonFetches.push(r.url());});
  await page.goto("/");const heading=page.getByRole("heading",{name:data.heading.fr,exact:true});await expect(heading).toBeVisible();expect(jsonFetches).toEqual([]);
  const rgb="rgb("+[1,3,5].map(i=>parseInt(data.background.slice(i,i+2),16)).join(", ")+")";expect(await page.locator("body").evaluate(node=>getComputedStyle(node).backgroundColor)).toBe(rgb);
});

test("serves each installed font and media range on its exact technical path without locale redirection",async({request})=>{
  for(const font of builtinFonts)for(const face of font.faces){const response=await request.get(face.path,{maxRedirects:0});expect(response.status(),face.path).toBe(200);expect(response.headers().location).toBeUndefined();expect((await response.body()).subarray(0,4).toString()).toBe("wOF2");}
  for(const path of [presentationFixture().assets.video,presentationFixture().assets.mobileVideo]){
    const whole=await request.get(path);expect(whole.status()).toBe(200);const bytes=await whole.body();
    for(const method of ["GET","HEAD"]){const redirect=await request.fetch(path,{method,headers:{Range:"bytes=0-31"},maxRedirects:0});expect(redirect.status()).toBe(307);expect(redirect.headers()["cache-control"]).toContain("no-store");expect(redirect.headers()["x-content-type-options"]).toBe("nosniff");expect((await redirect.body()).length).toBe(0);const response=await request.fetch(redirect.headers().location!,{method,headers:{Range:"bytes=0-31"}});expect(response.status()).toBe(206);expect(response.headers()["content-type"]).toContain("video/mp4");if(method==="GET"){expect(response.headers()["content-range"]).toBe(`bytes 0-31/${bytes.length}`);expect(await response.body()).toEqual(bytes.subarray(0,32));}else expect((await response.body()).length).toBe(0);}

  }
  for(const path of ["/fonts/unlisted.woff2","/fonts/hanken-grotesk/unlisted.woff2","/presentation-assets/not-a-uuid","/presentation-assets/11111111-1111-4111-8111-111111111111/extra"]){const response=await request.get(path,{maxRedirects:0});expect(response.status()).toBe(404);expect(response.headers().location).toBeUndefined();}
});

test("keeps drafts, hidden sections, private paths and credentials out of HTML/RSC and browser storage",async({page,request})=>{
  const data=presentationFixture(),base=fixture(),artifacts:string[]=[],network:string[]=[];page.on("request",r=>network.push(r.url()+JSON.stringify(r.headers())+(r.postData()??"")));
  for(const path of ["/","/en","/news","/artworks","/artworks/"+base.published[0]!.id]){
    const response=await request.get(path);expect(response.status()).toBe(200);artifacts.push(await response.text());
    const rsc=await request.get(path+"?_rsc=presentation",{headers:{RSC:"1"}});expect(rsc.headers()["cache-control"]).toContain("no-store");artifacts.push(await rsc.text());
    await page.goto(path);await expect(page.getByRole("heading",{level:1})).toBeVisible();artifacts.push(await page.content());
  }
  artifacts.push(await page.evaluate(()=>JSON.stringify({local:{...localStorage},session:{...sessionStorage}})));
  for(const secret of [...data.privateMarkers,...base.secrets])expect(artifacts.some(body=>body.includes(secret)),"private presentation data disclosed").toBe(false);
  for(const secret of [...data.privateMarkers.filter(value=>!data.deliveryStorageKeys.includes(value)),...base.secrets])expect(network.some(body=>body.includes(secret)),"private data disclosed in network").toBe(false);
  expect(network.some(url=>[base.backendOrigin,base.sourceOrigin,base.identityOrigin].some(origin=>url.startsWith(origin)))).toBe(false);
});

test("refreshes publication and media authorization on history back and persisted pageshow",async({page,request})=>{
  const data=presentationFixture();await page.goto("/");await expect(page.getByRole("heading",{name:data.heading.fr,exact:true})).toBeVisible();
  await page.getByTestId("hero-media").getByRole("link",{name:data.discoverLabel.fr,exact:true}).click();await expect(page).toHaveURL(/\/artworks$/);
  await control(request,"presentation-mode",{mode:"withdrawn"});
  for(const path of Object.values(data.assets)){const response=await request.get(path,{headers:{Range:"bytes=0-31","If-None-Match":"*"}});expect(response.status()).toBe(404);expect(response.headers()["content-range"]).toBeUndefined();}
  await page.goBack();await expect(page.getByRole("heading",{name:data.heading.fr,exact:true})).toHaveCount(0);
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent("pageshow",{persisted:true})));await expect(page.getByRole("heading",{name:data.heading.fr,exact:true})).toHaveCount(0);
  expect(await page.content()).not.toContain(data.assets.video);
});

test("retains locale switches, business routes and early 404 responses",async({page,request})=>{
  const data=presentationFixture(),art=fixture().published[0]!;await page.goto("/");
  await page.getByRole("navigation",{name:"Langue",exact:true}).getByRole("link",{name:"English",exact:true}).click();await expect(page).toHaveURL(/\/en$/);await expect(page.getByRole("heading",{name:data.heading.en,exact:true})).toBeVisible();
  for(const prefix of ["","/en"])for(const path of ["/news","/artworks","/exhibitions","/publications","/expertise","/contact","/artworks/"+art.id]){const response=await page.goto(prefix+path);expect(response?.status()).toBe(200);await expect(page.getByRole("heading",{level:1})).toBeVisible();await expect(page.locator("html")).toHaveAttribute("lang",prefix?"en":"fr");}
  for(const path of ["/unknown-page","/en/unknown-page","/artworks/"+fixture().hiddenId]){const response=await request.get(path);expect(response.status()).toBe(404);expect(await response.text()).not.toContain(fixture().hiddenTitle);}
});
