import {test,expect} from '@playwright/test';
import {teamScenario} from './team-fixture';
test('preserves founder hierarchy, exact order and layout at each width and 200 percent text',async({page},info)=>{
 test.setTimeout(120000);
 await teamScenario();
 for(const width of [390,1440]){await page.setViewportSize({width,height:1000});await page.goto('/');const section=page.locator('[data-our-team]');await section.scrollIntoViewIfNeeded();await section.screenshot({path:info.outputPath(`our-team-normal-${width}.png`)});}
 await teamScenario(4,30,true);
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});await page.goto('/');const section=page.locator('[data-our-team]');await expect(section).toBeVisible();await expect(section.locator('[data-team-person]')).toHaveCount(30);expect(await section.locator('ul').first().locator('li').count()).toBe(4);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await section.scrollIntoViewIfNeeded();if(width===390||width===1440)await section.screenshot({path:info.outputPath(`our-team-${width}.png`)});
  await section.locator('h2,h3,h4,a').evaluateAll(elements=>{const sizes=elements.map(el=>parseFloat(getComputedStyle(el).fontSize));elements.forEach((el,index)=>{(el as HTMLElement).style.fontSize=`${sizes[index]!*2}px`;});});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 }
 await page.addStyleTag({content:'html{font-size:200% !important}'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await teamScenario(0,6);await page.goto('/');await expect(page.locator('[data-our-team]').getByRole('heading',{name:'Fondateurs',exact:true})).toHaveCount(0);
 await teamScenario(1,1);await page.goto('/');await expect(page.locator('[data-team-person]')).toHaveCount(1);await expect(page.getByRole('heading',{name:'Membres',exact:true})).toHaveCount(0);
 await teamScenario(0,0);await page.goto('/');await expect(page.locator('[data-our-team]')).toHaveCount(0);await teamScenario();
});
