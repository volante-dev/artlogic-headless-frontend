import {test,expect} from '@playwright/test';
import {createFormTemplate} from '../lib/forms/templates.generated';
const origin=process.env.E2E_FORMS_INQUIRY_ORIGIN;
test.skip(!origin||!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin),'Uses the isolated component fixture with intercepted API requests.');
test.use({baseURL:origin});
test('prefills the artwork, remembers confirmed identity and preserves edited drafts between artworks',async({page,context})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));let submitted=0;
 await context.route('**/api/forms/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path.endsWith('/submit')){submitted++;return route.fulfill({json:{reference:'FORM-TEST',acceptedAt:new Date().toISOString()}});}
  if(path.endsWith('/sessions'))return route.fulfill({json:{sessionId:crypto.randomUUID(),versionId:'90000000-0000-4000-8000-000000000020',capability:'A'.repeat(43),document:createFormTemplate('contact',['fr','en']),expiresAt:new Date(Date.now()+3600000).toISOString(),limits:{maxObjects:10,maxImages:50,maxSourceBytes:25000000,maxTotalSourceBytes:500000000,imageMaxEdge:2000,sessionTtlSeconds:3600}}});
  if(route.request().method()==='GET')return route.fulfill({json:{availability:'open'}});
  throw Error('Unexpected fixture request');
 });
 await page.goto('/?artwork=a');await expect(page.getByLabel('Sujet',{exact:true})).toHaveValue(/Objet A/);await expect(page.getByLabel('Message',{exact:true})).toHaveValue(/Bonjour[\s\S]*Objet A/);
 await page.getByLabel('Nom',{exact:true}).fill('Camille Martin');await page.getByLabel('Adresse e-mail',{exact:true}).fill('camille@example.test');expect(await page.evaluate(()=>sessionStorage.getItem('artlogic:contact-identity:v1'))).toBeNull();await page.getByRole('button',{name:'Envoyer',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Demande reçue');expect(submitted).toBe(1);
 await page.goto('/?artwork=b');await expect(page.getByLabel('Nom',{exact:true})).toHaveValue('Camille Martin');await expect(page.getByLabel('Adresse e-mail',{exact:true})).toHaveValue('camille@example.test');await expect(page.getByLabel('Sujet',{exact:true})).toHaveValue(/Objet B/);await expect(page.getByLabel('Message',{exact:true})).toHaveValue(/Objet B/);
 await page.getByLabel('Sujet',{exact:true}).fill('Sujet personnel');await page.getByLabel('Message',{exact:true}).fill('');await page.reload();await expect(page.getByLabel('Sujet',{exact:true})).toHaveValue('Sujet personnel');await expect(page.getByLabel('Message',{exact:true})).toHaveValue('');expect(submitted).toBe(1);expect(errors).toEqual([]);
});
