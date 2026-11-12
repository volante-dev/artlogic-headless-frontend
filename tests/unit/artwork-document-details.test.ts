import {describe,expect,it} from "vitest";
import {artworkDocumentContent} from "../../lib/artworks/document-content";
const snapshot=(year:string|null)=>({locale:"fr",artwork:{title:"T",artist:"A",year,medium:"Bois",dimensions:"10 cm"}}) as unknown as Parameters<typeof artworkDocumentContent>[0];
describe("artwork detail rows",()=>{
 it.each([null,"","   "])("omits the year row when the year is %j",year=>{
  expect(artworkDocumentContent(snapshot(year)).details.map(([key])=>key)).toEqual(["artwork.medium","artwork.dimensions"]);
 });
 it("keeps a filled year",()=>{expect(artworkDocumentContent(snapshot("1920")).details[0]).toEqual(["artwork.year","1920"]);});
});
