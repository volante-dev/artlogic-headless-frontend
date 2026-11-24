import {test,expect} from "@playwright/test";
import {rattonSites,rattonWork} from "./ratton-fixture";
test("authenticated frozen preview keeps the chosen view, inert inquiry and a fresh reopening",async({context})=>{
 const site=rattonSites()[0]!,admin=await context.newPage();
 await admin.goto(site.adminOrigin+'/auth/login');await admin.getByRole('button',{name:/continuer avec le compte de test/i}).click();await admin.waitForURL(url=>url.origin===site.adminOrigin&&url.pathname==='/');
 await admin.goto(site.adminOrigin+'/artworks/'+rattonWork(2));
 const [preview]=await Promise.all([context.waitForEvent('page'),admin.getByRole('button',{name:'Prévisualiser',exact:true}).click()]);await preview.waitForURL(/\/preview$/);
 await preview.getByLabel('Largeur',{exact:true}).selectOption('375');
 const frame=preview.frameLocator('iframe'),root=frame.locator('[data-artwork-view="lucas-ratton"]');await expect(root).toBeVisible();await expect.poll(()=>root.locator('[data-ratton-current] img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
 await expect(root.getByRole('link',{name:'Demander des informations',exact:true})).toHaveAttribute('aria-disabled','true');
 await root.getByRole('button',{name:'Vue suivante',exact:true}).click();await expect(root.locator('[data-ratton-counter]')).toHaveText('2 / 2');
 await frame.getByRole('button',{name:'Fermer la fiche de l’œuvre',exact:true}).click();await frame.getByRole('button',{name:'Rouvrir l’œuvre',exact:true}).click();await expect(root.locator('[data-ratton-counter]')).toHaveText('1 / 2');
 await preview.getByRole('button',{name:'Fermer l’aperçu',exact:true}).click();await admin.close();
});
