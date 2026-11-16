import {it,expect} from "vitest";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {FooterView} from "../../components/footer/FooterView";
import styles from "../../components/SiteFooter.module.css";
import {siteVariables} from "../../branding/create-site-theme";
import projection from "../../clients/default/projection.json";
import type {ResolvedFooter,PresentationTheme} from "../../lib/presentation/types";
it("renders maximum service/group/social content with a single footer and no duplicate link trees",async()=>{
 const footer:ResolvedFooter={schemaVersion:1,scope:"public",locale:"fr",showDescription:true,showLanguageSelector:true,services:Array.from({length:3},(_,i)=>({id:"service"+i,title:"Un service de la galerie",description:"Une description qui reste lisible lorsque le texte s’agrandit.",destination:{kind:"page" as const,pageKey:"contact" as const,href:"/contact"}})),groups:Array.from({length:4},(_,i)=>({id:"group"+i,title:"Découvrir la galerie et ses collections",links:Array.from({length:12},(_,j)=>({id:"link"+i+j,label:"Une destination au libellé long pour découvrir les collections et leur histoire",destination:{kind:"page" as const,pageKey:"artworks" as const,href:"/artworks"}}))})),socialLinks:Array.from({length:8},(_,i)=>({id:"social"+i,label:"Réseau "+i,destination:{kind:"external" as const,href:"https://example.org/"+i}}))};
 footer.address={type:"doc",content:[{type:"paragraph",content:[{type:"text",text:"25 rue de la Galerie"}]}]};
 const html=renderToStaticMarkup(createElement(FooterView,{footer,siteName:"Une galerie au nom long",description:"Sa description héritée.",homeHref:"/",socialLabel:"Suivez-nous"}));expect((html.match(/<footer/g)??[]).length).toBe(1);expect((html.match(/<a /g)??[]).length).toBe(60);expect(html).not.toContain("<form");expect(html).toContain("25 rue de la Galerie");expect(html).toContain("© "+new Date().getFullYear());
 const css=(await readFile(new URL("../../components/SiteFooter.module.css",import.meta.url),"utf8")).replace(/\.([a-zA-Z_][a-zA-Z_0-9-]*)/g,(text,key)=>styles[key]?"."+styles[key]:text);
 const directory=new URL("../../../backend/.runtime/footer-max-proof/",import.meta.url);await mkdir(directory,{recursive:true});await writeFile(new URL("maximum.html",directory),'<!doctype html><html lang="fr"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}'+siteVariables(projection as PresentationTheme)+css+'</style><body>'+html+'</body></html>');
});

it("renders contributed credit text and links, without an implicit studio credit",()=>{
 const render=(footer:ResolvedFooter|null)=>renderToStaticMarkup(createElement(FooterView,{footer,siteName:"Galerie",description:"",homeHref:"/",socialLabel:"Suivez-nous"}));
 const footer:ResolvedFooter={schemaVersion:1,scope:"public",locale:"fr",services:[],groups:[],socialLinks:[],showDescription:false,showLanguageSelector:false,credit:{type:"doc",content:[{type:"paragraph",content:[{type:"text",text:"Conçu par "},{type:"text",text:"Atelier Exemple",marks:[{type:"link",attrs:{href:"https://example.org/studio"}}]}]}]}};
 const html=render(footer);expect(html).toContain("Conçu par ");expect(html).toContain('href="https://example.org/studio" target="_blank" rel="noopener noreferrer"');expect(html).toContain("Atelier Exemple");expect(html).not.toContain("Studio Volante");
 for(const credit of [undefined,null]){const empty=render({...footer,credit});expect(empty).not.toContain("Atelier Exemple");expect(empty).not.toContain("studio-volante.fr");}
 expect(render(null)).not.toContain("studio-volante.fr");
});
