import {randomInt} from "node:crypto";
import {resolve} from "node:path";
import {test,expect} from "@playwright/test";
const enabled=process.env.E2E_FORMS_RECIPE==="true"&&process.env.E2E_BASE_URL==="http://127.0.0.1:3010"&&process.env.E2E_FORMS_MAX_IMAGES==="true";
test.skip(!enabled,"Only the explicitly enabled isolated maximum-volume Forms recipe is permitted.");

test("mobile maximum Expertise is one complete dossier in authenticated reception",async({browser},info)=>{
 test.setTimeout(360000);
 const context=await browser.newContext({viewport:{width:375,height:812},hasTouch:true}),page=await context.newPage();
 try{
  const visitor=`127.23.${randomInt(1,250)}.${randomInt(1,250)}`;
  await page.route("**/api/forms/**",route=>route.continue({headers:{...route.request().headers(),"x-contact-mock-visitor":visitor}}));
  await page.goto("http://127.0.0.1:3010/expertise");
  await page.locator('input[type="file"][multiple]').first().setInputFiles(Array.from({length:50},()=>resolve(process.cwd(),"../backend/mock/fixtures/forms/images/opaque.png")));
  const dialog=page.getByRole("dialog");await expect(dialog).toBeVisible();await expect(dialog.getByText("Prête",{exact:true})).toHaveCount(50,{timeout:240000});
  for(let object=0;object<10;object++){
   await dialog.getByRole("tab",{name:/^Photos/}).tap();const tray=dialog.getByRole("region",{name:"Vos photos",exact:true});
   for(let index=0;index<5;index++)await tray.getByRole("checkbox",{name:/^Sélectionner /}).nth(index).check();
   await dialog.getByRole("button",{name:"Créer un objet avec la sélection",exact:true}).tap();
  }
  await dialog.getByRole("button",{name:"Continuer",exact:true}).tap();
  for(let index=0;index<10;index++){
   await dialog.getByRole("textbox",{name:"Désignation",exact:false}).fill(`Objet mobile synthétique ${index+1}`);
   await dialog.getByRole("button",{name:"Continuer",exact:true}).tap();
  }
  const name=dialog.getByRole("textbox",{name:"Nom",exact:false});await name.focus();await page.keyboard.type("Collectionneur mobile synthétique");
  await page.keyboard.press("Tab");await expect(dialog.getByRole("textbox",{name:"Adresse e-mail",exact:false})).toBeFocused();await page.keyboard.type("maximum-mobile@example.test");
  await dialog.getByRole("button",{name:"Continuer",exact:true}).tap();await expect(dialog.getByRole("heading",{name:"Vérifiez votre demande",exact:true})).toBeVisible();
  const requests:unknown[]=[];page.on("request",request=>{if(request.method()==="POST"&&new URL(request.url()).pathname.endsWith("/submit"))requests.push(request.postDataJSON());});
  await dialog.getByRole("button",{name:"Envoyer",exact:true}).tap();const receipt=dialog.getByText(/^Référence : FORM-/);await expect(receipt).toBeVisible();expect(requests).toHaveLength(1);
  const reference=(await receipt.textContent())!.match(/FORM-[0-9a-f-]{36}/i)![0],id=reference.slice(5).toLowerCase();
  const admin=await context.newPage();await admin.goto("http://127.0.0.1:3012/forms/reception");await admin.getByRole("button",{name:/se connecter/i}).click();await admin.getByRole("button",{name:/continuer avec le compte de test/i}).click();await expect(admin.locator(".admin-shell")).toBeVisible();
  const read=await admin.evaluate(async value=>{const response=await fetch("/api/forms/submissions/"+value,{cache:"no-store"});return {status:response.status,data:await response.json()};},id);
  expect(read.status).toBe(200);expect(read.data.reference).toBe(reference);expect(read.data.readAt).toBeNull();expect(read.data.objects).toHaveLength(10);expect(read.data.attachments).toHaveLength(50);
  expect(new Set(read.data.attachments.map((value:{id:string})=>value.id)).size).toBe(50);
  for(const object of read.data.objects){const images=read.data.attachments.filter((value:{objectId:string})=>value.objectId===object.id);expect(images).toHaveLength(5);expect(images.filter((value:{primary:boolean})=>value.primary)).toHaveLength(1);}
  const repeat=await admin.evaluate(async value=>{const response=await fetch("/api/forms/submissions/"+value,{cache:"no-store"});return {status:response.status,data:await response.json()};},id);expect(repeat.status).toBe(200);expect(repeat.data).toEqual(read.data);
  await info.attach("mobile-maximum-reception.json",{body:JSON.stringify({browser:info.project.name,viewport:{width:375,height:812},emulatedTouch:true,physicalTouch:false,objects:10,attachments:50,submitRequests:1,authenticatedReception:true,inertRead:true}),contentType:"application/json"});
 }finally{await context.close();}
});
