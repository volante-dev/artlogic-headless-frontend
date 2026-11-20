import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
for(const width of [390,1440])test(`availability follows the source in the final description at ${width}px`,async({page,request},info)=>{
 test.setTimeout(60000);
 const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0];
 test.skip(!site.finaleArtworkIds,'Requires --finale fixtures');
 const artworkId=site.finaleArtworkIds[3];
 const set=async(availableForSale:boolean|null)=>{const r=await request.post(site.controlUrl,{headers:{'X-Test-Control':site.controlKey},data:{action:'saleAvailability',artworkId,availableForSale}});expect(r.ok()).toBe(true);};
 await page.setViewportSize({width,height:900});
 await page.goto('/artworks');await page.getByRole('button',{name:'Compris',exact:true}).press('Enter');
 const open=async(locale='fr')=>{
  await page.goto((locale==='en'?'/en':'')+'/artworks/'+artworkId);
  const scene=page.getByTestId('artwork-experience');await expect(scene).toHaveAttribute('data-artwork-opening-phase','complete');
  await scene.locator('[data-artwork-progress] button').last().click();
  const reading=scene.locator('[data-finale-description]').filter({visible:true});await expect(reading).toBeVisible();
  await expect(scene.locator('[data-finale-black]')).toHaveCSS('opacity','1');
  await expect(reading.locator('..')).toHaveCSS('opacity','1');
  return reading;
 };
 try{
  await set(true);let reading=await open();const badge=reading.locator('[data-artwork-availability]');await badge.scrollIntoViewIfNeeded();
  await expect(badge).toHaveText('DISPONIBLE');await expect(badge.locator('strong')).toHaveCSS('font-weight','700');await expect(badge).toHaveCSS('font-size','11px');await expect(badge.locator('[aria-hidden]')).toHaveCSS('background-color','rgb(152, 203, 187)');
  await page.screenshot({path:info.outputPath(`available-${width}.png`)});
  reading=await open('en');await expect(reading.locator('[data-artwork-availability]')).toHaveText('AVAILABLE');
  await set(false);reading=await open();await expect(reading.locator('[data-artwork-availability]')).toHaveCount(0);
  await set(null);reading=await open();await expect(reading.locator('[data-artwork-availability]')).toHaveCount(0);
 }finally{await set(null);}
});
