import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
test("the slug artwork CTA preserves UUID and sends only to the local SMTP capture",async({page,request})=>{
 const site=JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites[0];
 await page.goto("/en/artworks/"+site.artworkId);const cta=page.getByRole("link",{name:"Enquire about this artwork",exact:true});await cta.scrollIntoViewIfNeeded();await cta.click();await expect(page).toHaveURL(site.siteOrigin+"/en/contact?artwork="+site.artworkId);
 for(const [name,value]of [["Name","Synthetic visitor"],["Email address","visitor@example.test"],["Message","Synthetic artwork enquiry"]])await page.getByRole("textbox",{name,exact:true}).fill(value);
 await page.getByRole("button",{name:"Send enquiry",exact:true}).click();await expect(page.getByTestId("contact-receipt")).toBeVisible();
 await expect.poll(async()=>{const response=await request.post(site.controlUrl,{headers:{"x-test-control":site.controlKey},data:{action:"mail",artworkId:site.artworkId}});return (await response.json()).contextual;},{timeout:20000}).toBe(true);
});
