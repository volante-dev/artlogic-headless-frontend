import {test,expect} from '@playwright/test';
import {teamScenario} from './team-fixture';
test('shows only available contacts and keeps identities when language or image transport changes',async({page,browserName})=>{
 await teamScenario(2,8);await page.goto('/');const section=page.locator('[data-our-team]'),people=section.locator('[data-team-person]');await expect(people).toHaveCount(8);
 for(let i=0;i<4;i++){const card=people.nth(i);await expect(card.locator('a[href^="mailto:"]')).toHaveCount(i===1||i===3?1:0);await expect(card.locator('a[href^="tel:"]')).toHaveCount(i===2||i===3?1:0);}
 const mail=people.nth(1).locator('a[href^="mailto:"]'),phone=people.nth(2).locator('a[href^="tel:"]');
 await expect(mail).toHaveAccessibleName(/Écrire à Prénom 2 Membre 2/);await expect(phone).toHaveAccessibleName(/Appeler Prénom 3 Membre 3/);
 await mail.focus();await expect(mail).toBeFocused();await page.keyboard.press(browserName==='webkit'?'Alt+Tab':'Tab');await expect(phone).toBeFocused();
 const names=await people.locator('h4').allTextContents();await page.goto('/en');await expect(page.locator('[data-our-team]').getByRole('heading',{name:'Founders',exact:true})).toBeVisible();expect(await page.locator('[data-team-person] h4').allTextContents()).toEqual(names);
 await page.route('**/presentation-assets/**',r=>r.abort());await page.goto('/');await expect(page.locator('[data-team-person]')).toHaveCount(8);await expect(page.locator('[data-team-person]').nth(1).locator('a[href^="mailto:"]')).toBeVisible();
});
