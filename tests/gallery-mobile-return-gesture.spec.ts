import {test,expect} from '@playwright/test';
import {openMobile} from './gallery-mobile-helpers';
test('swipes back from the conclusion and continues backwards through the photos',async({page},info)=>{
 const scene=await openMobile(page),buttons=scene.locator('[data-artwork-progress] button');
 await buttons.nth(2).click();await expect(scene).toHaveAttribute('data-mobile-transition','idle');await buttons.last().click();await expect(scene).toHaveAttribute('data-mobile-mode','finale');
 await page.waitForTimeout(1800);
 const photo=scene.locator('[data-finale-photo][data-active="true"]');const rect=await photo.boundingBox();expect(rect!.height).toBeLessThan(page.viewportSize()!.height*.3);
 const above=await buttons.first().evaluate(node=>{const r=node.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===node;});expect(above).toBe(true);
 await page.screenshot({path:info.outputPath('mobile-finale.png')});
 const frame=(await scene.getByTestId('artwork-frame').boundingBox())!;const x=frame.x+frame.width*.4,y=frame.y+frame.height*.2;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y+60,{steps:5});await page.mouse.up();
 await expect(scene).toHaveAttribute('data-mobile-mode','gallery');
 // A second backwards gesture must also work while the conclusion reverses.
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y+60,{steps:5});await page.mouse.up();
 await expect(buttons.nth(1)).toHaveAttribute('aria-current','step');await expect(scene.locator('[data-artwork-finale]')).toHaveCount(0);
});
