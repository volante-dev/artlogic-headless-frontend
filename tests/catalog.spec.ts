import {test,expect} from "@playwright/test";
import {fixture,control} from "./helpers";
test("shows exactly the 20 selected works without a login or upstream browser requests",async({page})=>{
  const data=fixture(),requests:string[]=[];page.on("request",request=>requests.push(request.url()));await page.goto("/");
  await expect(page.getByRole("heading",{name:"Œuvres",exact:true})).toBeVisible();await expect(page.getByTestId("artwork-card")).toHaveCount(20);
  const paths=await page.getByTestId("artwork-card").locator("a").evaluateAll(nodes=>nodes.map(node=>new URL((node as HTMLAnchorElement).href).pathname));
  expect(paths.sort()).toEqual(data.published.map(art=>"/artworks/"+art.id).sort());expect(requests.some(url=>url.startsWith(data.sourceOrigin)||url.startsWith(data.identityOrigin)||url.startsWith(data.backendOrigin)||url.includes("/storage/v1/"))).toBe(false);
  await expect(page.getByRole("link",{name:/connexion/i})).toHaveCount(0);
});
test("explains an empty published catalog without inventing artworks",async({page,request})=>{
  await control(request,"hide-all");try{await page.goto("/");await expect(page.getByText("Aucune œuvre publiée pour le moment.")).toBeVisible();await expect(page.getByTestId("artwork-card")).toHaveCount(0);}
  finally{await control(request,"restore-selection");}
});
