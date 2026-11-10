import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

test('refined filters keep search stable, animate counts and offer contact for empty results',async({page})=>{
 const {sites}=JSON.parse(await readFile(process.env.E2E_GALLERY_FIXTURE!,'utf8'));
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  await page.goto(sites[0].siteOrigin+'/artworks');
  await expect(page.locator('input[name=types]').first()).toBeEnabled();
  const search=page.getByRole('searchbox'),before=await search.boundingBox();
  await page.getByRole('button',{name:'Filtres',exact:true}).click();
  const option=page.getByRole('checkbox',{name:'Masque',exact:true});
  await option.check();
  await expect(page).toHaveURL(/types=8/);
  await expect(page.locator('[data-filter-count]')).toHaveAttribute('data-filter-count','1');
  const after=await search.boundingBox();
  expect(after!.x).toBeCloseTo(before!.x,1);expect(after!.width).toBeCloseTo(before!.width,1);
  await page.getByRole('checkbox',{name:'Sculpture',exact:true}).check();
  await expect(page).toHaveURL(/types=8%2C12/);
  await expect(option).toBeChecked();
  await expect(page.locator('[data-filter-count]')).toHaveAttribute('data-filter-count','2');
  expect(await option.evaluate(el=>getComputedStyle(el).opacity)).toBe('0');
  await expect(page.locator('[data-type-motion]')).toHaveAttribute('data-type-motion','open');
  await page.waitForTimeout(450);
  await page.screenshot({path:`../backend/.runtime/types029/refined-${width}.png`});
  await page.goto(sites[0].siteOrigin+'/artworks?types=99');
  await expect(page.getByText('Vous cherchez un objet en particulier ? Nous pouvons le chercher pour vous.',{exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Contactez-nous',exact:true})).toHaveAttribute('href','/contact');
  await page.screenshot({path:`../backend/.runtime/types029/empty-${width}.png`});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
