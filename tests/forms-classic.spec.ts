import {randomInt} from "node:crypto";
import {test,expect,type Page} from "@playwright/test";
const enabled=process.env.E2E_FORMS_RECIPE==="true"&&process.env.E2E_BASE_URL==="http://127.0.0.1:3010";
test.skip(!enabled,"Only run on the isolated Forms recipe, never on a client deployment.");
async function fields(page:Page){
 await expect(page.locator("[data-editorial-form] form, form[data-editorial-form]")).toBeVisible();
 const labels=await page.evaluate(()=>{const key=Object.keys(sessionStorage).find(k=>k.startsWith("artlogic:forms:v1:"));if(!key)throw new Error("missing recipe session");const state=JSON.parse(sessionStorage.getItem(key)!);return state.session.document.fields.filter((f:{type:string})=>["shortText","longText","email","phone"].includes(f.type)).map((f:{type:string;translations:Record<string,{label:string}>})=>({type:f.type,label:f.translations.fr!.label}));});
 for(const field of labels)await page.getByRole("textbox",{name:field.label,exact:false}).fill(field.type==="email"?"recipe@example.test":field.type==="phone"?"+33123456789":"Réponse synthétique de recette");
}
async function fill(page:Page){await page.setExtraHTTPHeaders({"X-Contact-Mock-Visitor":`127.18.${randomInt(1,250)}.${randomInt(1,250)}`});await page.goto("/");await fields(page);}
test("submits one classic form and retains its receipt on reload",async({page})=>{
 test.setTimeout(60000);await fill(page);const sent=page.waitForResponse(r=>/\/api\/forms\/sessions\/[^/]+\/submit$/.test(r.url()));await page.getByRole("button",{name:"Envoyer",exact:true}).click();expect((await sent).status()).toBe(200);await expect(page.getByText(/^Votre demande a (bien )?été reçue\.$/)).toBeVisible();const reference=await page.getByText(/^Référence : FORM-/).innerText();await page.reload();await expect(page.getByText(reference,{exact:true})).toBeVisible();
});
test("recovers a lost confirmation with the original proof instead of creating a second request",async({page})=>{
 test.setTimeout(60000);await fill(page);let attempts=0;await page.route("**/api/forms/sessions/*/submit",async route=>{attempts++;await route.fetch();await route.abort("failed");});await page.getByRole("button",{name:"Envoyer",exact:true}).click();await expect(page.getByRole("button",{name:"Vérifier l’envoi",exact:true})).toBeEnabled();await page.getByRole("button",{name:"Vérifier l’envoi",exact:true}).click();await expect(page.getByText(/^Votre demande a (bien )?été reçue\.$/)).toBeVisible();expect(attempts).toBe(1);
});

test("twenty distinct submissions complete after commit and each new request keeps the previous receipt proof",async({page},info)=>{
 test.skip(info.project.name!=="chromium","One twenty-send performance sample; cross-browser flows are covered separately.");test.setTimeout(180000);await fill(page);const durations:number[]=[];
 for(let index=0;index<20;index++){
  if(index){await page.setExtraHTTPHeaders({"X-Contact-Mock-Visitor":`127.19.${randomInt(1,250)}.${randomInt(1,250)}`});await page.getByRole("button",{name:"Nouvelle demande",exact:true}).click();await fields(page);}
  const started=Date.now();await page.getByRole("button",{name:"Envoyer",exact:true}).click();await expect(page.getByText(/^Référence : FORM-/)).toBeVisible();durations.push(Date.now()-started);
 }
 const ordered=[...durations].sort((a,b)=>a-b),p95=ordered[Math.ceil(ordered.length*.95)-1]!;expect(await page.evaluate(()=>Object.keys(sessionStorage).filter(key=>key.startsWith("artlogic:forms:receipt:v1:")).length)).toBe(19);await info.attach("confirmation-timings.json",{body:JSON.stringify({sample:20,attachments:0,durationsMs:durations,p95Ms:p95,includesClickCommitAndVisibleReceipt:true}),contentType:"application/json"});expect(p95).toBeLessThan(3000);
});

// Only the expiry boundary is simulated; initialization still uses the isolated real BFF.
test("retains answers and the expiry explanation after uncertain recovery and reload",async({page})=>{
 test.setTimeout(60000);await fill(page);
 const before=await page.evaluate(()=>{const key=Object.keys(sessionStorage).find(key=>key.startsWith("artlogic:forms:v1:"));if(!key)throw new Error("missing recipe session");return JSON.parse(sessionStorage.getItem(key)!);});
 let submitAttempts=0;
 await page.route("**/api/forms/sessions/*/submit",async route=>{submitAttempts++;await route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({error:{code:"service_unavailable"}})});});
 await page.route("**/api/forms/receipts/recover",route=>route.fulfill({status:404,contentType:"application/json",body:JSON.stringify({error:{code:"form_receipt_not_found"}})}));
 await page.route("**/api/forms/sessions/"+before.session.sessionId,route=>route.fulfill({status:410,contentType:"application/json",body:JSON.stringify({error:{code:"form_session_expired"}})}));
 await page.getByRole("button",{name:"Envoyer",exact:true}).click();
 await page.getByRole("button",{name:"Vérifier l’envoi",exact:true}).click();
 const expiry=page.getByText(/Cette session a expiré\. Vos informations restent visibles/);
 await expect(expiry).toBeVisible();await page.reload();await expect(expiry).toBeVisible();
 const after=await page.evaluate(()=>{const key=Object.keys(sessionStorage).find(key=>key.startsWith("artlogic:forms:v1:"));if(!key)throw new Error("missing recipe session");return JSON.parse(sessionStorage.getItem(key)!);});
 expect(after.phase).toBe("expired");expect(after.answers).toEqual(before.answers);expect(after.submissionProof).toBe(before.submissionProof);expect(submitAttempts).toBe(1);
 await expect(page.getByRole("button",{name:"Nouvelle demande",exact:true})).toBeEnabled();
 // A failed renewal must leave the expired draft recoverable, then a successful renewal keeps its text.
 await page.route("**/api/forms/*/sessions",route=>route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({error:{code:"service_unavailable"}})}));
 await page.getByRole("button",{name:"Nouvelle demande",exact:true}).click();await expect(page.getByText("Impossible de reprendre la demande. Votre saisie est conservée ; réessayez.",{exact:true})).toBeVisible();
 await page.unroute("**/api/forms/*/sessions");await page.getByRole("button",{name:"Nouvelle demande",exact:true}).click();
 await expect(page.getByRole("button",{name:"Envoyer",exact:true})).toBeEnabled();
 const renewed=await page.evaluate(()=>{const key=Object.keys(sessionStorage).find(key=>key.startsWith("artlogic:forms:v1:"))!;return JSON.parse(sessionStorage.getItem(key)!);});
 expect(renewed.session.sessionId).not.toBe(before.session.sessionId);expect(renewed.submissionProof).not.toBe(before.submissionProof);const imageIds=new Set(before.session.document.fields.filter((field:{type:string})=>field.type==="images").map((field:{id:string})=>field.id));expect(Object.fromEntries(Object.entries(renewed.answers).filter(([id])=>!imageIds.has(id)))).toEqual(Object.fromEntries(Object.entries(before.answers).filter(([id])=>!imageIds.has(id))));for(const id of imageIds)expect(renewed.answers[id as string]??[]).toEqual([]);expect(renewed.attempt).toBeNull();expect(submitAttempts).toBe(1);
});
