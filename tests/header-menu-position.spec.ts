import {test,expect,type Page} from '@playwright/test';
const trigger=(page:Page)=>page.locator('button[aria-controls="site-navigation"]');
async function aligned(page:Page){
 await expect.poll(()=>page.locator('header').evaluate(header=>{
  const surface=header.querySelector<HTMLElement>('[data-menu-surface]')!,box=surface.getBoundingClientRect(),fill=header.querySelector('[data-menu-fill]')!.getBoundingClientRect(),controls=header.querySelector('#site-navigation')!.getBoundingClientRect(),bounds=header.getBoundingClientRect(),style=getComputedStyle(surface);
  return Math.max(Math.abs(fill.top-bounds.bottom),Math.abs(controls.top-bounds.bottom),Math.abs(fill.left-box.left-parseFloat(style.paddingLeft)),Math.abs(fill.bottom-box.bottom+parseFloat(style.paddingBottom)));
 })).toBeLessThan(1);
}
for(const reducedMotion of ['no-preference','reduce'] as const)test(`mobile menu tracks position changes before and after opening (${reducedMotion})`,async({page},info)=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion});
 await page.route('**/*',route=>['image','media','font'].includes(route.request().resourceType())?route.abort():route.continue());
 await page.goto('/artworks');const header=page.locator('header');await expect(header).toHaveAttribute('data-menu-motion','closed',{timeout:15000});
 const before=(await header.boundingBox())!;
 // Moving the header does not notify ResizeObserver: this is the previously stale geometry.
 await header.evaluate(node=>{const spacer=document.createElement('div');spacer.dataset.menuPositionSpacer='';spacer.style.height='44px';node.before(spacer);});
 const shifted=(await header.boundingBox())!;expect(shifted.height).toBeCloseTo(before.height,1);expect(shifted.y-before.y).toBeCloseTo(44,1);
 await trigger(page).click();await expect(header).toHaveAttribute('data-menu-motion','open');await aligned(page);
 // A scroll-only change (e.g. scroll restoration) must not leave the old top edge behind.
 await page.evaluate(()=>scrollTo(0,28));await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(28);await aligned(page);
 await page.setViewportSize({width:390,height:704});await aligned(page);await expect(trigger(page)).toHaveAttribute('aria-expanded','true');
 await page.screenshot({path:info.outputPath('menu-position-after-scroll-and-resize.png')});
 await page.keyboard.press('Escape');await expect(header).toHaveAttribute('data-menu-state','closed');await expect(page.locator('html')).not.toHaveCSS('overflow','hidden');
 await page.evaluate(()=>{document.querySelector('[data-menu-position-spacer]')?.remove();scrollTo(0,0);});
 await trigger(page).click();await expect(header).toHaveAttribute('data-menu-motion','open');await aligned(page);
 await page.keyboard.press('Escape');await expect(header).toHaveAttribute('data-menu-state','closed');await expect(trigger(page)).toBeFocused();
});
