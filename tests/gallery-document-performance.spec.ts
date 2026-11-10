import {test,expect} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
test('document readiness uses the same production measurement before and after',async({page},info)=>{
 test.setTimeout(600000);
 const stage=process.env.E2E_DOCUMENT_MEASURE_STAGE;test.skip(!stage,'Explicit baseline/after measurement only');
 const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,'utf8')).sites[0];
 const samples:{mode:string;ms:number}[]=[];
 for(const mode of ['direct','internal'])for(let i=0;i<30;i++){
  await page.goto('/artworks?pageSize=3',{waitUntil:'domcontentloaded'});await expect(page.getByTestId('artwork-card').first()).toBeVisible();
  const started=performance.now();
  if(mode==='direct')await page.goto('/artworks/'+site.artworkId,{waitUntil:'domcontentloaded'});else await page.getByTestId('artwork-card').first().getByRole('link').click();
  const scene=page.getByTestId('artwork-experience');await expect(scene).toHaveAttribute('data-artwork-opening-phase','complete',{timeout:20000});
  await expect(page.getByRole('button',{name:'Fermer la fiche de l’œuvre',exact:true})).toBeVisible();
  if(await scene.locator('img').count())await scene.locator('img').first().evaluate(async n=>{await(n as HTMLImageElement).decode();},undefined,{timeout:10000});else await expect(scene).toHaveAttribute('data-artwork-media-ready','true');
  samples.push({mode,ms:performance.now()-started});if(i%10===9)console.log(mode+': '+(i+1)+'/30');
 }
 const p95=(mode:string)=>{const a=samples.filter(x=>x.mode===mode).map(x=>x.ms).sort((a,b)=>a-b);return a[Math.ceil(a.length*.95)-1];};
 const report={stage,project:info.project.name,build:'production',network:'local loopback',cache:'same context; catalog warmed before each opening',samples,p95:{direct:p95('direct'),internal:p95('internal')}};
 const dir=resolve('../backend/.runtime/document028');mkdirSync(dir,{recursive:true});writeFileSync(resolve(dir,stage+'-'+info.project.name+'.json'),JSON.stringify(report,null,2));
 if(stage==='after'){const baselinePath=resolve(dir,'baseline-'+info.project.name+'.json');expect(existsSync(baselinePath)).toBe(true);const baseline=JSON.parse(readFileSync(baselinePath,'utf8'));for(const mode of ['direct','internal'] as const)expect(report.p95[mode],mode+' p95').toBeLessThanOrEqual(baseline.p95[mode]*1.1);}
});
