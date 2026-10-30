import {test,expect} from "@playwright/test";
test("numbered catalogue spans all 45 published works and survives reload",async({page})=>{
  await page.goto("/artworks");
  await expect(page.getByTestId("artwork-card")).toHaveCount(20);
  const pagination=page.getByRole("navigation",{name:"Pagination des œuvres",exact:true});
  await pagination.getByRole("link",{name:"Page 2",exact:true}).click();
  await expect(page).toHaveURL(/page=2/);await expect(page.getByTestId("artwork-card")).toHaveCount(20);
  await page.reload();await expect(pagination.getByRole("link",{name:"Page 2",exact:true})).toHaveAttribute("aria-current","page");
  await pagination.getByRole("link",{name:"Page suivante",exact:true}).click();await expect(page.getByTestId("artwork-card")).toHaveCount(5);
  await expect(page.getByTestId("artwork-card").filter({hasText:"démonstration 46"})).toHaveCount(0);
});
test("global accent-insensitive search reaches a work outside the initial page; clear starts again",async({page})=>{
  await page.goto("/artworks?page=2");
  await page.getByRole("searchbox",{name:"Rechercher par titre ou artiste",exact:true}).fill("demonstration 43");
  await page.getByRole("button",{name:"Rechercher",exact:true}).click();
  await expect(page.getByTestId("artwork-card")).toHaveCount(1);await expect(page.getByTestId("artwork-card")).toContainText("43");
  expect(new URL(page.url()).searchParams.has("catalogRevision")).toBe(false);expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  await page.getByRole("link",{name:"Effacer la recherche",exact:true}).click();await expect(page.getByTestId("artwork-card")).toHaveCount(20);
});
test("language preserves a valid numbered query and no results has no fake page one of zero",async({page})=>{
  await page.goto("/artworks?q=definitely-no-synthetic-match&pageSize=10");
  await expect(page.getByText("Aucune œuvre ne correspond à cette recherche.",{exact:true})).toBeVisible();
  await expect(page.getByRole("navigation",{name:"Pagination des œuvres",exact:true})).toHaveCount(0);
  await page.getByRole("link",{name:"English",exact:true}).click();
  await expect(page).toHaveURL(/\/en\/artworks\?q=definitely-no-synthetic-match&pageSize=10/);
  await expect(page.getByRole("searchbox")).toHaveValue("definitely-no-synthetic-match");
});
test("invalid, mixed and out-of-range queries offer an explicit restart",async({page})=>{
  for(const query of ["page=4","page=0","cursor=legacy&q=search","q=a&q=b"]){
    await page.goto("/artworks?"+query);await expect(page.getByTestId("artwork-card")).toHaveCount(0);
    await page.getByRole("link",{name:"Revenir à la première page",exact:true}).click();
    await expect(page.getByTestId("artwork-card")).toHaveCount(20);
  }
});
