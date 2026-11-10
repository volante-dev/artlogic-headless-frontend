import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test('publication indexes emit descriptions and omit the all-categories control',async({page,request})=>{
 const {sites}=JSON.parse(await readFile(process.env.E2E_GALLERY_FIXTURE!,'utf8'));
 for(const path of ['/publications','/en/publications']){
  const response=await request.get(sites[0].siteOrigin+path,{headers:{'User-Agent':'Mozilla/5.0 Chrome-Lighthouse'}});expect(response.status()).toBe(200);
  const html=await response.text(),head=html.slice(0,html.indexOf('</head>'));
  expect(head).toMatch(/<meta name="description" content="[^\"]+"/);
  expect(head).toMatch(/<meta property="og:description" content="[^\"]+"/);
  for(const width of [1440,390]){await page.setViewportSize({width,height:900});await page.goto(sites[0].siteOrigin+path);await expect(page.locator('meta[name=description]')).toHaveAttribute('content',/\S/);await expect(page.getByRole('button',{name:/^(Toutes les catégories|All categories)$/})).toHaveCount(0);}
 }
});
