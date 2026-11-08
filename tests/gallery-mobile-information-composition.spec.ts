import {test,expect} from '@playwright/test';
import {openMobile,swipe} from './gallery-mobile-helpers';
test('one semantic identity, selected image and contact survive the transformation',async({page})=>{
 const scene=await openMobile(page);await swipe(page);const media=await scene.getAttribute('data-active-media');
 await scene.getByRole('button',{name:'Voir les informations',exact:true}).click();
 await expect(scene.locator('[data-mobile-information-panel]')).toHaveAttribute('data-information-phase','reading');
 await expect(scene.getByRole('heading',{level:1})).toHaveCount(1);
 await expect(scene.locator('[data-information-contact] a')).toHaveCount(1);
 expect(await scene.getAttribute('data-active-media')).toBe(media);
});
