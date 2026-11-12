import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {describe,expect,it} from "vitest";
import {HeroMedia,type HeroMediaSection} from "../../sections/HeroMedia";
const render=(props:HeroMediaSection["props"])=>renderToStaticMarkup(createElement(HeroMedia,{siteName:"Galerie locale",section:{id:"11111111-1111-4111-8111-111111111111",type:"heroMedia",schemaVersion:1,variant:"immersive",props:{linkLabel:"Voir les œuvres",...props}} as HeroMediaSection}));
const visibleTitle=(html:string)=>/<h1(?![^>]*srOnly)[^>]*>/.test(html);
describe("hero optional content",()=>{
 it.each([{},{heading:"",introduction:"  "}] as HeroMediaSection["props"][])("renders only the link when title and introduction are disabled (%j)",props=>{
  const html=render(props);
  expect(visibleTitle(html)).toBe(false);expect(html).toMatch(/<h1[^>]*srOnly[^>]*>Galerie locale<\/h1>/);
  expect(html).not.toMatch(/class="[^"]*introduction/);expect(html).toContain("Voir les œuvres");
 });
 it("renders introduction + link without a visible title",()=>{
  const html=render({introduction:"Découvrir la collection."});
  expect(visibleTitle(html)).toBe(false);expect(html).toContain("Découvrir la collection.");expect(html).toContain("Voir les œuvres");
 });
 it("renders title + link without an introduction",()=>{
  const html=render({heading:"Galerie\nlocale"});
  expect(visibleTitle(html)).toBe(true);expect(html).not.toMatch(/class="[^"]*introduction/);expect(html).toContain("Voir les œuvres");
 });
});
