import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const sites=()=>JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites as {siteOrigin:string;artworkId:string;finaleArtworkIds:string[]}[];
test('the initial public document contains real paragraphs, photographs and native links',async({page,request})=>{
 test.setTimeout(120000);
 for(const site of sites())for(const locale of ['fr','en'])for(const id of site.finaleArtworkIds){
  const response=await request.get(site.siteOrigin+(locale==='en'?'/en':'')+'/artworks/'+id);expect(response.status()).toBe(200);
  const result=await page.evaluate(html=>{const d=new DOMParser().parseFromString(html,'text/html'),a=d.querySelector('[data-artwork-readable]');return {exists:!!a,h1:a?.querySelectorAll('h1').length,photos:[...a?.querySelectorAll('img')??[]].map(x=>({src:x.getAttribute('src'),alt:x.getAttribute('alt')})),paragraphs:a?.querySelectorAll('[data-document-description] p').length,provenance:a?.querySelector('[data-document-provenance]')?.textContent,contact:a?.querySelector('a[href*="/contact?artwork="]')?.getAttribute('href')};},await response.text());
  expect(result.exists).toBe(true);expect(result.h1).toBe(1);expect(result.contact).toContain(id);
  expect(result.paragraphs).toBe(id===site.finaleArtworkIds[0]?0:id===site.finaleArtworkIds.at(-1)&&locale==='fr'?100:9);if(id===site.finaleArtworkIds[0])expect(result.provenance).toBeUndefined();else expect(result.provenance).toContain('Collection synthétique A');
  for(const photo of result.photos){expect(photo.src).toMatch(/^\/media\//);expect(photo.alt).toBeTruthy();}
 }
});
test('without scripts, streamed document and its contact remain readable',async({browser})=>{
 const site=sites()[0],context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
 try{await page.goto(site.siteOrigin+'/artworks/'+site.finaleArtworkIds[3]);const doc=page.locator('[data-artwork-readable]');await expect(doc).toBeVisible();await expect(doc.locator('h1')).toBeVisible();await expect(doc.locator('[data-document-description] p')).toHaveCount(9);await expect(doc.locator('[data-document-provenance]')).toBeVisible();await expect(doc.getByRole('link',{name:'Demander des informations',exact:true})).toBeVisible();await doc.locator('a[href*="/contact?artwork="]').scrollIntoViewIfNeeded();await expect(doc.locator('a[href*="/contact?artwork="]')).toBeInViewport();await expect(page.locator('[data-artwork-experience]')).toHaveCount(0);}finally{await context.close();}
});
