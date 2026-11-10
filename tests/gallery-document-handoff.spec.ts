import {test,expect} from '@playwright/test';import {readFileSync} from 'node:fs';
test('conclusion paragraphs survive entry and reverse without changing the journey',async({page})=>{
 const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0];await page.goto('/artworks/'+site.finaleArtworkIds[3]);
 const scene=page.getByTestId('artwork-experience');await expect(scene).toHaveAttribute('data-artwork-opening-phase','complete');await expect(page.locator('[data-artwork-readable]')).toHaveCount(0);
 await expect(scene.locator('[data-finale-card]')).toHaveCount(0);const details=scene.locator('[data-finale-details]');await expect(details.locator('p')).not.toHaveCount(0);await expect(details).not.toBeVisible();
 await details.locator('p').first().evaluate(n=>Reflect.set(window,'documentParagraph',n));let textReads=0;page.on('request',r=>{if(r.url().includes('/api/artwork-experiences/'))textReads++;});
 await scene.getByRole('button',{name:'Conclusion',exact:true}).click();await expect(details).toBeVisible();await page.waitForTimeout(1800);
 expect(await details.locator('p').first().evaluate(n=>Reflect.get(window,'documentParagraph')===n)).toBe(true);
 await scene.getByRole('button',{name:/Présentation 1/}).click();await expect(scene.locator('[data-artwork-finale]')).toHaveCount(0);await expect(details).not.toBeVisible();
 expect(await details.locator('p').first().evaluate(n=>Reflect.get(window,'documentParagraph')===n)).toBe(true);expect(textReads).toBe(0);expect(await scene.locator('h1').count()).toBe(1);
});
