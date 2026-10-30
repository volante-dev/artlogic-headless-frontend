import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
const fixture=()=>JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites[0];
test("legacy cursors remain usable; changed, unavailable and empty catalogues recover explicitly",async({page,request})=>{
 const site=fixture(),control=(data:object)=>request.post(site.controlUrl,{headers:{"x-test-control":site.controlKey},data});
 try{
  const response=await request.get(site.apiOrigin+"/v1/public/artworks?limit=3"),cursor=(await response.json()).nextCursor;expect(cursor).toBeTruthy();
  await page.goto("/artworks?cursor="+encodeURIComponent(cursor));await expect(page.getByTestId("artwork-card")).toHaveCount(20);
  const catalog=await request.get(site.apiOrigin+"/v1/public/artwork-catalog?pageSize=3"),revision=(await catalog.json()).catalogRevision;
  await control({action:"revision"});await page.goto("/artworks?pageSize=3&catalogRevision="+revision);await expect(page.getByRole("link",{name:"Revenir à la première page",exact:true})).toBeVisible();
  await control({action:"outage",kind:"catalog"});await page.goto("/artworks");await expect(page.getByRole("link",{name:/Réessayer/})).toBeVisible();
  await control({action:"restore"});await control({action:"empty"});await page.goto("/artworks");await expect(page.getByRole("status").filter({hasText:/Aucune œuvre/})).toBeVisible();await expect(page.getByTestId("artwork-card")).toHaveCount(0);
 }finally{await control({action:"restore"});}
});
test("Forward rechecks availability and a failed read never restores stale artwork content",async({page,request})=>{
 const site=fixture(),control=(data:object)=>request.post(site.controlUrl,{headers:{"x-test-control":site.controlKey},data});
 try{
  await page.goto("/artworks?pageSize=3");await page.getByTestId("artwork-card").getByRole("link").first().click();await expect(page.getByRole("dialog").getByTestId("artwork-experience")).toBeVisible();
  await page.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true}).click();await expect(page.getByRole("dialog")).toHaveCount(0);
  await control({action:"visibility",artworkId:site.artworkId,decision:"hidden"});await page.goForward();await expect(page.getByRole("dialog")).toBeVisible();await expect(page.getByTestId("artwork-experience")).toHaveCount(0);await expect(page.getByRole("dialog").getByText(/plus disponible/i).first()).toBeVisible();
  await page.getByRole("button",{name:"Fermer la fiche de l’œuvre",exact:true}).click();await expect(page).toHaveURL(/pageSize=3/);
  await control({action:"restore"});await control({action:"outage",kind:"experience"});await page.goto("/artworks/"+site.artworkId);await expect(page.getByRole("dialog")).toBeVisible();await expect(page.getByTestId("artwork-experience")).toHaveCount(0);await expect(page.getByRole("button",{name:/Réessayer/})).toBeVisible();
  await control({action:"outage",kind:"none"});await page.getByRole("button",{name:/Réessayer/}).click();await expect(page.getByTestId("artwork-experience")).toBeVisible();
 }finally{await control({action:"restore"});}
});
