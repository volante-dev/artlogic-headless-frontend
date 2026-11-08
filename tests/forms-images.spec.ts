import {randomInt} from "node:crypto";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {test,expect,type Page,type Locator} from "@playwright/test";
const enabled=process.env.E2E_FORMS_RECIPE==="true"&&process.env.E2E_BASE_URL==="http://127.0.0.1:3010",fixtures=resolve(process.cwd(),"../backend/mock/fixtures/forms/images");
test.skip(!enabled,"Only the isolated synthetic Forms recipe is permitted.");
async function open(page:Page){const visitor=`127.21.${randomInt(1,250)}.${randomInt(1,250)}`;await page.route("**/api/forms/**",route=>route.continue({headers:{...route.request().headers(),"x-contact-mock-visitor":visitor}}));await page.goto("/");const form=page.locator("form[data-editorial-form]").filter({has:page.locator('input[type="file"][multiple]')}).first();await expect(form).toBeVisible();const id=await form.evaluate(element=>element.closest("section")?.id);if(!id)throw new Error("recipe_form_placement_missing");return page.locator(`[id="${id}"]`);}
async function fillText(host:Locator){for(const field of await host.locator('input:not([type="file"]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):visible,textarea:visible').all()){const type=await field.getAttribute("type");await field.fill(type==="email"?"fifty@example.test":type==="tel"?"+33123456789":"Recette synthétique cinquante images");}}
test("drops mixed image formats in one batch, prepares HEIC, restores ready images and submits",async({page},info)=>{
 test.setTimeout(120000);const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));const host=await open(page);
 const payload=await Promise.all(["oriented-gps.jpg","transparent.png","single.heic"].map(async name=>({name,mime:name.endsWith(".heic")?"image/heic":name.endsWith(".png")?"image/png":"image/jpeg",bytes:(await readFile(resolve(fixtures,name))).toString("base64")})));
 const data=await page.evaluateHandle(files=>{const transfer=new DataTransfer();for(const file of files){const raw=atob(file.bytes),bytes=Uint8Array.from(raw,char=>char.charCodeAt(0));transfer.items.add(new File([bytes],file.name,{type:file.mime}));}return transfer;},payload);
 await host.getByRole("button",{name:/Déposez vos images ici/}).dispatchEvent("drop",{dataTransfer:data});
 await expect(host.getByText("Prête",{exact:true})).toHaveCount(3,{timeout:90000});await expect(host.locator("li img")).toHaveCount(3);
 await page.screenshot({path:info.outputPath("batch-images-desktop.png"),fullPage:true});await page.reload();await expect(host.getByText("Prête",{exact:true})).toHaveCount(3);await page.setViewportSize({width:375,height:812});await expect(page.locator("#site-navigation")).not.toBeVisible();await expect(host.locator("li img")).toHaveCount(3);await page.screenshot({path:info.outputPath("batch-images-mobile.png"),fullPage:true});
 await fillText(host);
 await host.getByRole("button",{name:"Envoyer",exact:true}).click();await expect(host.getByText(/^Référence : FORM-/)).toBeVisible();expect(errors).toEqual([]);
});
test("selects multiple files and removes one without re-uploading the other ready image",async({page})=>{
 test.setTimeout(90000);const host=await open(page);let puts=0;page.on("request",request=>{if(request.method()==="PUT"&&request.url().includes("/storage/"))puts++;});
 await host.locator('input[type="file"][multiple]').setInputFiles([resolve(fixtures,"opaque.png"),resolve(fixtures,"wide.webp")]);await expect(host.getByText("Prête",{exact:true})).toHaveCount(2,{timeout:60000});await host.getByRole("button",{name:"Retirer opaque.png",exact:true}).click();await expect(host.getByText("Prête",{exact:true})).toHaveCount(1);expect(puts).toBe(2);
});
test("confirms a request with fifty prepared images in under three seconds",async({page},info)=>{
 test.skip(info.project.name!=="chromium"||process.env.E2E_FORMS_MAX_IMAGES!=="true","Explicit maximum-volume recipe on Chromium.");test.setTimeout(180000);const host=await open(page);
 const buffer=await readFile(resolve(fixtures,"opaque.png"));await host.locator('input[type="file"][multiple]').setInputFiles(Array.from({length:50},(_,index)=>({name:`synthetic-${index+1}.png`,mimeType:"image/png",buffer})));
 await expect(host.getByText("Prête",{exact:true})).toHaveCount(50,{timeout:150000});
 await fillText(host);
 const started=Date.now();await host.getByRole("button",{name:"Envoyer",exact:true}).click();await expect(host.getByText(/^Référence : FORM-/)).toBeVisible();const durationMs=Date.now()-started;await info.attach("fifty-images-confirmation.json",{body:JSON.stringify({attachments:50,durationMs,includesClickValidationAttachmentCommitAndVisibleReceipt:true}),contentType:"application/json"});expect(durationMs).toBeLessThan(3000);
});
