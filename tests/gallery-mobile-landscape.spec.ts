import {test,expect} from "@playwright/test";
import {mobileSite,openMobile,swipe} from "./gallery-mobile-helpers";

test("horizontal photos sit sharp and edge to edge above a blurred cover without another image request",async({page})=>{
 const requests:string[]=[];page.on("request",r=>{if(new URL(r.url()).pathname.startsWith("/media/"))requests.push(new URL(r.url()).pathname+new URL(r.url()).search);});
 const scene=await openMobile(page),photo=scene.locator('[data-finale-photo][data-active="true"]'),image=photo.locator("img"),backdrop=photo.locator("canvas");
 await expect(photo).toHaveAttribute("data-landscape","true");await expect(backdrop).toHaveAttribute("data-ready","true");
 await expect(image).toHaveCSS("object-fit","contain");await expect(image).toHaveCSS("filter","none");
 await expect(backdrop).toHaveCSS("object-fit","cover");
 const filter=await backdrop.evaluate(n=>getComputedStyle(n).filter);expect(filter).toContain("blur(24px)");expect(filter).toContain("brightness(0.45)");
 const geometry=await image.evaluate((img:HTMLImageElement)=>{const rect=img.getBoundingClientRect();return {width:rect.width,left:rect.left,right:rect.right,screen:innerWidth,paintedWidth:Math.min(rect.width,rect.height*img.naturalWidth/img.naturalHeight)};});
 expect(geometry.left).toBeCloseTo(0,0);expect(geometry.right).toBeCloseTo(geometry.screen,0);expect(geometry.paintedWidth).toBeCloseTo(geometry.screen,0);
 expect(await backdrop.evaluate((canvas:HTMLCanvasElement)=>Math.max(canvas.width,canvas.height))).toBeLessThanOrEqual(512);
 const selectedPath=await image.evaluate((img:HTMLImageElement)=>{const u=new URL(img.currentSrc);return u.pathname+u.search;});expect(requests.filter(path=>path===selectedPath)).toHaveLength(1);
 await page.screenshot({path:test.info().outputPath("landscape-contained.png")});
 await scene.getByRole("button",{name:"Agrandir l’image ×2",exact:true}).click();await expect(scene).toHaveAttribute("data-inline-zoom","true");await expect(backdrop).toHaveCSS("visibility","hidden");
 await scene.getByRole("button",{name:"Revenir à la taille normale",exact:true}).click();await expect(scene).toHaveAttribute("data-inline-zoom","false");await expect(image).toHaveCSS("object-fit","contain");await expect(backdrop).toHaveCSS("visibility","visible");
 await swipe(page);await expect(scene.locator('[data-active="true"] img')).toHaveCSS("object-fit","contain");await expect(scene.locator('[data-active="true"] canvas')).toHaveAttribute("data-ready","true");
});

test("square photographs keep their existing cover presentation",async({page})=>{
 const site=mobileSite() as ReturnType<typeof mobileSite>&{artworkId:string};await page.goto("/artworks/"+site.artworkId);
 const scene=page.getByTestId("artwork-experience");await expect(scene).toHaveAttribute("data-artwork-opening-phase","complete");
 await scene.getByRole("navigation").getByRole("button").nth(1).click();await expect(scene).toHaveAttribute("data-mobile-transition","idle");
 const photo=scene.locator('[data-finale-photo][data-active="true"]');await expect(photo).not.toHaveAttribute("data-landscape","true");await expect(photo.locator("canvas")).toHaveCount(0);await expect(photo.locator("img")).toHaveCSS("object-fit","cover");
});

test("a missing image keeps its backdrop empty and leaves the modal closable",async({page})=>{
 await page.route("**/media/**",route=>route.abort());const scene=await openMobile(page);
 const photo=scene.locator('[data-finale-photo][data-active="true"]');await expect(photo.locator("img")).toHaveCount(0);
 await expect(photo.locator("canvas")).not.toHaveAttribute("data-ready","true");
 await expect(page.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true})).toBeEnabled();
});
