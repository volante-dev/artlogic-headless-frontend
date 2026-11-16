import {expect,type Page} from '@playwright/test';
export async function verifyGuestCheckout(page:Page){
 const started=Date.now();
 page.setDefaultTimeout(10000);
 const stripeRequests:string[]=[];page.on('request',request=>{if(/https:\/\/(?:js|api)\.stripe\.com/.test(request.url()))stripeRequests.push(request.url());});
 await page.goto('/store');await expect(page.getByRole('heading',{name:/Store/})).toBeVisible();
 await page.getByRole('button',{name:'Tout refuser',exact:true}).click();
 for(const name of ['Livre de recette','Sac de recette']){await page.getByRole('article').filter({has:page.getByRole('heading',{name,exact:true})}).getByRole('button',{name:'Ajouter au panier'}).click();await expect(page.getByRole('dialog',{name:'Panier'})).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Panier'})).toBeHidden();}
 const cart=page.getByRole('button',{name:/Panier/});await expect(cart).toContainText('2');await cart.click();
 await page.evaluate(()=>{(window as unknown as Record<string,unknown>).commerceCheckoutDocument='same';});
 await page.getByRole('dialog',{name:'Panier'}).getByRole('link',{name:'Commander',exact:true}).click();await expect(page.getByRole('heading',{name:'Contact',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>(window as unknown as Record<string,unknown>).commerceCheckoutDocument)).toBe('same');
 await page.getByRole('textbox',{name:/e-mail/i}).fill('client-checkout@example.test');await page.getByRole('button',{name:'Continuer',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Livraison',exact:true})).toBeVisible();await page.getByRole('combobox',{name:/Pays/}).click();await page.getByRole('option',{name:'France',exact:true}).click();
 await page.getByRole('textbox',{name:/Nom complet/}).fill('Camille Recette');await page.getByRole('textbox',{name:/^Adresse/}).fill('11 rue de la Recette');await page.getByRole('textbox',{name:/^Ville/}).fill('Paris');await page.getByRole('textbox',{name:/Code postal/}).fill('75006');await page.getByRole('button',{name:'Continuer',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Facturation',exact:true})).toBeVisible();await page.getByRole('checkbox').uncheck();
 await page.getByRole('combobox',{name:/Pays/}).click();await page.getByRole('option',{name:/Hong Kong/}).click();
 await page.getByRole('textbox',{name:/Nom complet/}).fill('Camille Facturation');await page.getByRole('textbox',{name:/^Adresse/}).fill('2 Example Road');await page.getByRole('textbox',{name:/^Ville/}).fill('Hong Kong');
 await page.getByRole('button',{name:'Continuer',exact:true}).click();await expect(page.getByRole('heading',{name:'Vérification',exact:true})).toBeVisible();
 await expect(page.getByRole('complementary',{name:'Récapitulatif de commande'})).toContainText(/53,00/);await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Continuer vers le paiement'}).click();
 await expect(page.getByRole('heading',{name:'Paiement',exact:true})).toBeVisible();await expect(page.getByText('Paiement simulé',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Simuler un refus'}).click();await expect(page.getByRole('alert').filter({hasText:'Paiement refusé dans la simulation'})).toBeVisible();await expect(cart).toContainText('2');
 let reads=0;await page.route('**/api/store/attempts/*',async route=>{if(route.request().method()!=='GET')return route.continue();const response=await route.fetch(),value=await response.json();if(value.paymentState==='paid'&&++reads<=2){const delayed={...value,status:'payable',paymentState:'unpaid',nextAction:'pay'};delete delayed.order;delete delayed.orderNumber;return route.fulfill({response,json:delayed});}return route.fulfill({response});});
 await page.getByRole('button',{name:'Simuler le paiement',exact:true}).click();await expect(page.getByRole('heading',{name:'Votre commande est confirmée'})).toBeVisible({timeout:15000});await expect(cart).toContainText('0');
 expect(await page.evaluate(()=>(window as unknown as Record<string,unknown>).commerceCheckoutDocument)).toBe('same');
 const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Télécharger la facture'}).click();expect((await downloaded).suggestedFilename()).toMatch(/^SYN-\d+\.html$/);
 await page.reload();await expect(page.getByRole('heading',{name:'Votre commande est confirmée'})).toBeVisible();await expect(cart).toContainText('0');
 expect(stripeRequests).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 return Date.now()-started;
}
