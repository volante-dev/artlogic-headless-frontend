import {readFile,mkdir} from "node:fs/promises";
import {chromium} from "@playwright/test";
const connection=JSON.parse(await readFile(new URL("../../backend/.runtime/public-browser-connection.json",import.meta.url),"utf8"));
const browser=await chromium.launch(),plateOnly=process.argv.includes("--plate-only"),full=process.argv.includes("--full");
await mkdir(new URL("../.impeccable/review/",import.meta.url),{recursive:true});
try{
  const page=await browser.newPage({viewport:{width:1586,height:992}});
  const response=await page.goto(connection.origin,{waitUntil:"networkidle"});if(!response?.ok())throw new Error("preview_not_ready");
  await page.locator('[data-testid="hero-media"]').waitFor();
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});
  if(plateOnly)await page.addStyleTag({content:"header,.skip,nextjs-portal{visibility:hidden!important}"});
  else await page.addStyleTag({content:"nextjs-portal{display:none!important}"});
  const hero=page.locator('[data-testid="hero-media"]');console.log(JSON.stringify({status:response.status(),hero:await hero.boundingBox(),fonts:await page.evaluate(()=>document.fonts.status)}));
  await page.screenshot({path:new URL("../.impeccable/review/hero-repro.png",import.meta.url).pathname});
  if(full)for(const [name,width,height] of [["desktop",1440,900],["mobile",390,844],["user-375",375,812]]){
    await page.setViewportSize({width,height});await page.goto(connection.origin,{waitUntil:"networkidle"});await page.evaluate(()=>document.fonts.ready);await page.addStyleTag({content:"nextjs-portal{display:none!important}"});
    await page.screenshot({path:new URL("../.impeccable/review/"+name+".png",import.meta.url).pathname,fullPage:true});
  }
}finally{await browser.close();}
