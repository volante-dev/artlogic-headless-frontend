import {test,expect} from '@playwright/test';import {readFileSync} from 'node:fs';
test('mobile keeps conclusion and information nodes while only the current panel is accessible',async({page})=>{
 const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0];await page.goto('/artworks/'+site.finaleArtworkIds[3]);const scene=page.getByTestId('artwork-experience');await expect(scene).toHaveAttribute('data-artwork-opening-phase','complete');
 const layer=scene.locator('[data-finale-mobile-reading-layer]'),description=layer.locator('[data-finale-description]'),body=scene.locator('[data-information-body]');
 await expect(description.locator('p')).toHaveCount(9);await expect(layer).not.toBeVisible();await expect(layer).toHaveAttribute('inert','');await expect(body).toHaveAttribute('inert','');
 await description.locator('p').first().evaluate(n=>Reflect.set(window,'persistentMobileParagraph',n));
 await scene.getByRole('button',{name:'Voir les informations',exact:true}).click();await expect(scene.locator('[data-mobile-information-panel]')).toHaveAttribute('data-information-phase','reading');await expect(body).not.toHaveAttribute('inert','');
 await scene.getByRole('button',{name:'Revenir aux images',exact:true}).click();await expect(scene).toHaveAttribute('data-mobile-mode','gallery');
 await scene.getByRole('button',{name:'Conclusion',exact:true}).click();await expect(layer).toBeVisible();await expect(layer).not.toHaveAttribute('inert','');
 await scene.locator('[data-artwork-progress] button').first().click();await expect(scene.locator('[data-artwork-finale]')).toHaveCount(0);await expect(layer).not.toBeVisible();expect(await description.locator('p').first().evaluate(n=>Reflect.get(window,'persistentMobileParagraph')===n)).toBe(true);await expect(scene.locator('h1')).toHaveCount(1);
});
