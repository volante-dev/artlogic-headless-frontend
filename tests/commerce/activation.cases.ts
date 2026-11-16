import {readFile} from 'node:fs/promises';
import {expect,type Page} from '@playwright/test';
import {verifyWithdrawal} from './withdrawal.cases';
export async function verifySuspendedCommerce(page:Page){
 page.setDefaultTimeout(15000);await page.setExtraHTTPHeaders({'x-contact-mock-visitor':'127.33.'+Math.floor(Math.random()*250)+'.'+Math.floor(Math.random()*250)});
 const scenario=process.env.E2E_COMMERCE_ACTIVATION_SCENARIO,fixturePath=process.env.E2E_COMMERCE_TRACKING_FIXTURE;if(!['api-off','frontend-off','both-off'].includes(scenario??'')||!fixturePath)throw new Error('isolated_activation_scenario_required');const fixture=JSON.parse(await readFile(fixturePath,'utf8')),paymentRequests:string[]=[],cartRequests:string[]=[];
 page.on('request',r=>{if(/https:\/\/([^/]*\.)?stripe\.com\//.test(r.url()))paymentRequests.push(new URL(r.url()).hostname);if(/\/api\/store\/(cart\/validate|products\/)/.test(r.url()))cartRequests.push(new URL(r.url()).pathname);});
 await page.addInitScript(({siteId})=>{localStorage.setItem('commerce:cart:'+siteId,JSON.stringify({version:1,items:[{productId:'32000000-0000-4000-8000-000000000002',quantity:1}],expiresAt:Date.now()+86400000}));},{siteId:fixture.siteId});
 await page.goto('/');await expect(page.getByRole('banner')).toBeVisible();await expect(page.getByRole('banner').getByRole('link',{name:'Store',exact:true})).toHaveCount(0);
 await page.goto('/store/order-tracking');await expect(page.getByRole('heading',{name:'Suivi de commande',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:/Panier/})).toHaveCount(0);expect(cartRequests).toEqual([]);
 const order=fixture.orders[0];await page.getByRole('textbox',{name:'Numéro de commande',exact:true}).fill(order.orderNumber);await page.getByRole('textbox',{name:'Adresse e-mail',exact:true}).fill(order.email);await page.getByRole('button',{name:'Consulter la commande',exact:true}).click();await expect(page.getByRole('region',{name:'État de la commande',exact:true})).toBeVisible();
 await page.goto('/store/checkout');await expect(page.getByRole('button',{name:/Payer|Pay now/})).toHaveCount(0);await expect(page.getByRole('textbox',{name:/Nom complet/})).toHaveCount(0);
 await page.goto('/store');await expect(page.getByRole('button',{name:'Ajouter au panier',exact:true})).toHaveCount(0);
 if(scenario==='both-off')await verifyWithdrawal(page);expect(paymentRequests).toEqual([]);expect(cartRequests).toEqual([]);
}
