import {test,expect} from '@playwright/test';
import {openMobile} from './gallery-mobile-helpers';
test('touch focus stays quiet and keyboard focus remains visible in the frosted mobile menu',async({page,browserName},info)=>{
 await page.goto('/artworks');const toggle=page.locator('header button[aria-controls="site-navigation"]');
 await toggle.tap();await expect(toggle).toHaveCSS('outline-style','none');const nav=page.locator('#site-navigation');await expect(nav).toBeVisible();
 await expect.poll(()=>page.locator('header').evaluate(node=>node.getAnimations({subtree:true}).length)).toBe(0);
 const first=nav.getByRole('navigation',{name:'Navigation principale',exact:true}).getByRole('link').first();
 expect(await first.evaluate(n=>parseFloat(getComputedStyle(n).fontSize))).toBeLessThan(29);
 await page.screenshot({path:info.outputPath('frosted-menu.png')});
 await page.keyboard.press(browserName==='webkit'?'Alt+Tab':'Tab');await expect(first).toBeFocused();await expect(first).toHaveCSS('outline-style','solid');
 await page.keyboard.press('Escape');await expect(toggle).toBeFocused();await expect(toggle).toHaveCSS('outline-style','solid');await expect(nav).toBeHidden();
 await toggle.tap();await expect(toggle).toHaveCSS('outline-style','none');await page.keyboard.press('Escape');
});
test('the artwork information panel covers the timeline without a sticky touch underline',async({page})=>{
 const scene=await openMobile(page),trigger=scene.locator('[data-mobile-trigger="information"]');await panelSamples(scene);await trigger.tap();await expect(trigger).toHaveCSS('text-decoration-line','none');await expect(trigger).toHaveCSS('outline-style','none');
 const panel=scene.locator('[data-mobile-information-panel]');await expect(panel).toHaveAttribute('data-information-ready','true');
 const shades=await page.evaluate(()=>Reflect.get(window,'informationShades') as number[]);expect(shades.length).toBeGreaterThan(15);expect(Math.min(...shades)).toBeGreaterThanOrEqual(.43);for(let i=1;i<shades.length;i++)expect(shades[i]).toBeGreaterThanOrEqual(shades[i-1]-.01);

 expect(await panel.evaluate(node=>Number(getComputedStyle(node).zIndex))).toBeGreaterThan(await scene.locator('[data-artwork-progress]').evaluate(node=>Number(getComputedStyle(node).zIndex)));
 await trigger.tap();await expect(scene).toHaveAttribute('data-mobile-mode','gallery');await expect(trigger).toHaveCSS('text-decoration-line','none');
});

async function panelSamples(scene:import('@playwright/test').Locator){await scene.evaluate(node=>{const surface=node.querySelector<HTMLElement>('[data-artwork-frost-surface]')!,samples:number[]=[];Reflect.set(window,'informationShades',samples);const start=performance.now();const sample=()=>{const color=getComputedStyle(surface).backgroundColor;const alpha=color.match(/\/\s*([\d.]+)\s*\)$/)?.[1]??color.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/)?.[1];samples.push(alpha?Number(alpha):1);if(performance.now()-start<2400)requestAnimationFrame(sample);};requestAnimationFrame(sample);});}
test('desktop navigation retains keyboard rings after pointer focus',async({page},info)=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/artworks');
 const home=page.getByRole('link',{name:/Retour à l’accueil/});await home.dispatchEvent('pointerdown',{pointerType:'mouse',isPrimary:true});await home.focus();await expect(home).toHaveCSS('outline-style','none');
 await page.keyboard.press('Tab');await home.focus();await expect(home).toHaveCSS('outline-style','solid');await expect(page.locator('header button[aria-controls="site-navigation"]')).toBeHidden();
 await page.screenshot({path:info.outputPath('desktop-keyboard-focus.png')});
});
