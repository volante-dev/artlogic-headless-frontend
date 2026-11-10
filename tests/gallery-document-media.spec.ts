import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
test('native media attributes match every published photo without decorative scene resources',async({page,request})=>{
 const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0];
 for(const [index,count] of [0,1,2,5,12].entries()){
  const response=await request.get('/artworks/'+site.finaleArtworkIds[index]);
  const result=await page.evaluate(html=>{const doc=new DOMParser().parseFromString(html,'text/html'),reader=doc.querySelector('[data-artwork-readable]')!;return{cards:doc.querySelectorAll('[data-finale-card]').length,images:[...reader.querySelectorAll('img')].map(n=>({src:n.getAttribute('src'),width:n.width,height:n.height,loading:n.loading,alt:n.alt}))};},await response.text());
  expect(result.cards).toBe(0);expect(result.images).toHaveLength(count);
  for(const image of result.images){expect(image.src).toMatch(/^\/media\/[a-f0-9-]{36}(?:\?|$)/);expect(image.width).toBeGreaterThan(0);expect(image.height).toBeGreaterThan(0);expect(image.alt).toBeTruthy();expect(image.loading).toBe('lazy');}
 }
});
test('a failed secondary photograph does not block the initial text or its conclusion',async({page,request})=>{
 const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0],id=site.finaleArtworkIds[3],response=await request.get(site.apiOrigin+'/v1/public/artwork-experiences/'+id+'?locale=fr'),data=await response.json();
 await page.route('**/media/'+data.artwork.media[1].id+'**',route=>route.abort());await page.goto('/artworks/'+id,{waitUntil:'domcontentloaded'});const scene=page.getByTestId('artwork-experience');await expect(scene).toHaveAttribute('data-artwork-opening-phase','complete');await expect(scene.locator('[data-finale-description] p')).toHaveCount(9);await scene.getByRole('button',{name:'Conclusion',exact:true}).click();await expect(scene.locator('[data-finale-description]')).toBeVisible();await expect(scene.locator('[data-finale-description] p')).toHaveCount(9);
});
