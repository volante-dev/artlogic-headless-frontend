import {test,expect} from "@playwright/test";
test.use({trace:"off",screenshot:"off",video:"off"});
test("reuses an image from the browser cache after a fresh publication authorization",async({page,request,browserName})=>{
 test.skip(process.env.E2E_PUBLIC_MEDIA_DIRECT!=="true"||browserName!=="chromium","Chromium cache protocol evidence");
 const session=await page.context().newCDPSession(page);await session.send("Network.enable");
 const terminalRequests=new Map<string,string>(),bytes=new Map<string,number>();
 session.on("Network.requestWillBeSent",event=>{const path=new URL(event.request.url).pathname;if(path.startsWith("/storage/v1/object/sign/"))terminalRequests.set(event.requestId,path);});
 session.on("Network.loadingFinished",event=>{const path=terminalRequests.get(event.requestId);if(path)bytes.set(path,(bytes.get(path)??0)+event.encodedDataLength);});
 await page.goto("/artworks");const first=page.getByTestId("artwork-image").first();
 await expect.poll(()=>first.evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
 const src=await first.getAttribute("src");expect(src?.startsWith("/media/")).toBe(true);
 const authorization=await request.get(src!,{maxRedirects:0});expect(authorization.status()).toBe(307);
 const target=new URL(authorization.headers().location!).pathname;
 await session.send("Performance.getMetrics");
 const baseline=bytes.get(target)??0;expect(baseline).toBeGreaterThan(0);
 const loaded=await page.evaluate(async(src)=>{
  const image=new Image(),url=new URL(src!,location.origin);url.searchParams.set("displayId","cache:repeat");image.src=url.href;document.body.appendChild(image);
  try{await image.decode();return image.naturalWidth>0;}finally{image.remove();}
 },src);
 await session.send("Performance.getMetrics");
 expect(loaded).toBe(true);expect(bytes.get(target)??0).toBe(baseline);
 await session.detach();
});
