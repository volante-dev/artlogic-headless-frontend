import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
for(const width of [390,1440])test(`availability stays below the fixed inquiry button at ${width}px`,async({page,request},info)=>{
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
  const contact=scene.locator(width<768?'[data-finale-contact]':'[data-artwork-information-contact]').filter({visible:true});
  return {reading,contact};
 };
 try{
  await set(true);let {reading,contact}=await open();const badge=contact.locator('[data-artwork-availability]');
  await expect(reading.locator('[data-artwork-availability]')).toHaveCount(0);await expect(badge).toBeVisible();
  const before=await badge.boundingBox(),button=await contact.locator('a').boundingBox();expect(before).not.toBeNull();expect(button).not.toBeNull();
  expect(before!.y-button!.y-button!.height).toBeGreaterThanOrEqual(8);expect(before!.y-button!.y-button!.height).toBeLessThanOrEqual(20);
  const viewport=await reading.boundingBox();expect(viewport!.y+viewport!.height).toBeLessThanOrEqual(button!.y-8);
  await reading.evaluate(node=>{node.scrollTop=node.scrollHeight;});expect((await badge.boundingBox())!.y).toBeCloseTo(before!.y,1);
  await expect(badge).toHaveText('DISPONIBLE');await expect(badge.locator('strong')).toHaveCSS('font-weight','700');await expect(badge).toHaveCSS('font-size','11px');await expect(badge.locator('[aria-hidden]')).toHaveCSS('background-color','rgb(152, 203, 187)');
  await page.screenshot({path:info.outputPath(`available-${width}.png`)});
  ({reading,contact}=await open('en'));await expect(contact.locator('[data-artwork-availability]')).toHaveText('AVAILABLE');
  await set(false);({reading,contact}=await open());await expect(contact.locator('[data-artwork-availability]')).toHaveCount(0);await expect(reading.locator('[data-artwork-availability]')).toHaveCount(0);
  await set(null);({reading,contact}=await open());await expect(contact.locator('[data-artwork-availability]')).toHaveCount(0);
 }finally{await set(null);}
});
