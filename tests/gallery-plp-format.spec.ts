import {test,expect} from "@playwright/test";
import {setPlp} from "./plp-helpers";
test.afterEach(async({request})=>{await setPlp(request,false,'none');});
test('search, page and modal return retain context in the active layout',async({page,request})=>{
 await setPlp(request,true);await page.goto('/artworks?page=2');await expect(page.getByTestId('artwork-card')).toHaveCount(20);const url=page.url(),card=page.getByTestId('artwork-card').nth(4),link=card.locator('a');await link.scrollIntoViewIfNeeded();await link.click();await expect(page.getByTestId('artwork-experience')).toBeVisible();await page.getByRole('button',{name:'Fermer la fiche de l’œuvre',exact:true}).click();await expect(page).toHaveURL(url);await expect(page.getByTestId('artwork-card')).toHaveCount(20);expect(new URL(page.url()).searchParams.has('display')).toBe(false);
 await page.getByRole('searchbox').fill('demonstration 43');await page.getByRole('button',{name:'Rechercher',exact:true}).click();await expect(page.getByTestId('artwork-card')).toHaveCount(1);
});
