import {expect,type Page} from '@playwright/test';
export async function addCatalogProduct(page:Page,name?:string,touch=false){
 const article=name?page.getByRole('article').filter({has:page.getByRole('heading',{name,exact:true})}):page.getByRole('article').first(),title=await article.getByRole('heading').first().innerText(),trigger=article.getByRole('button',{name:'Détails',exact:true});
 if(touch)await trigger.tap();else await trigger.click();
 const dialog=page.getByRole('dialog',{name:title,exact:true});await expect(dialog).toBeVisible();const add=dialog.getByRole('button',{name:'Ajouter au panier',exact:true});
 if(touch)await add.tap();else await add.click();await expect(dialog).toBeHidden();
}
