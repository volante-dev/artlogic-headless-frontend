import {test,expect} from '@playwright/test';
import {teamScenario,teamControl} from './team-fixture';
test('keeps base pages usable through extension failure and publication races',async({page})=>{
 await teamScenario();await teamControl('team-race-next');await page.goto('/');await expect(page.locator('[data-our-team]')).toBeVisible();await expect(page.locator('[data-team-person]')).toHaveCount(8);
 await teamControl('team-read-fail');try{await page.goto('/');await expect(page.locator('[data-our-team]')).toHaveCount(0);await expect(page.locator('main')).toBeVisible();await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();}finally{await teamControl('team-read-ok');}
});

test('omits only the optional section for absent or forbidden capabilities and repeated races',async({page})=>{
 await teamScenario();
 try{
  for(const code of [404,403,503]){
   await teamControl('team-capabilities-'+code);await page.goto('/');
   await expect(page.locator('[data-our-team]')).toHaveCount(0);
   await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();
  }
  await teamControl('team-capabilities-0');await teamControl('team-race-repeated');await page.goto('/');
  await expect(page.locator('[data-our-team]')).toHaveCount(0);await expect(page.locator('main')).toBeVisible();
 }finally{await teamControl('team-capabilities-0');await teamControl('team-race-stop');}
});

test('reads the team extension once for one normal page render',async({page})=>{
 await teamScenario();await teamControl('team-count-reset');await page.goto('/');
 await expect(page.locator('[data-team-person]')).toHaveCount(8);
 const result=await teamControl('team-count-read');expect(result.count).toBe(1);
});
