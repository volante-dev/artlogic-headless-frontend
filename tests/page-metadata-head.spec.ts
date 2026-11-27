import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

test.skip(!process.env.E2E_GALLERY_FIXTURE,'Requires the isolated gallery harness');
const siteOrigin=()=>JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0].siteOrigin as string;
const agents={
 desktop:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
 mobile:'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36',
 lighthouse:'Mozilla/5.0 Chrome/131.0.0.0 Safari/537.36 Chrome-Lighthouse',
};
test('active artwork metadata uses its effective canonical and localized paths in the initial head',async({request})=>{
 const id='03900000-0000-4000-8000-000000000001',dataResponse=await request.get(siteOrigin()+'/api/artwork-experiences/'+id+'?locale=fr',{headers:{'X-Artwork-Address-Contract':'1'}});test.skip(!dataResponse.ok(),'Requires the isolated active address fixture');const data=await dataResponse.json();test.skip(data.artworkAddresses?.mode!=='active','Requires an active address fixture');const address=data.artworkAddresses.items[0],response=await request.get(siteOrigin()+address.canonicalPath),html=await response.text(),head=html.slice(0,html.indexOf('</head>'));
 expect(response.status()).toBe(200);expect(head).toContain('property="og:url" content="'+siteOrigin()+address.canonicalPath+'"');expect(head).toContain('rel="canonical" href="'+siteOrigin()+address.canonicalPath+'"');for(const alternate of address.alternates)expect(head).toContain('href="'+siteOrigin()+alternate.path+'"');expect(head).not.toContain(data.artwork.slug);
});

for(const path of ['/','/en','/publications','/en/publications']){
 for(const [client,userAgent] of Object.entries(agents)){
  test(`${path} sends a unique description in the initial head for ${client}`,async({request})=>{
   const response=await request.get(siteOrigin()+path,{headers:{'User-Agent':userAgent}});
   expect(response.status()).toBe(200);
   const html=await response.text(),headEnd=html.indexOf('</head>');
   expect(headEnd).toBeGreaterThan(0);
   const head=html.slice(0,headEnd),description=/<meta name="description" content="[^"]*[^"\s][^"]*"[^>]*>/g;
   expect(head.match(description)).toHaveLength(1);
   expect(html.match(description)).toHaveLength(1);
   expect(head).toMatch(/<meta property="og:description" content="[^"]*[^"\s][^"]*"/);
  });
 }
 test(`${path} exposes its description without JavaScript`,async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,userAgent:agents.desktop});
  try{
   const page=await context.newPage();
   await page.goto(siteOrigin()+path);
   await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
   await expect(page.locator('head meta[name="description"]')).toHaveAttribute('content',/\S/);
   await expect(page.locator('body meta[name="description"]')).toHaveCount(0);
  }finally{await context.close();}
 });
}
