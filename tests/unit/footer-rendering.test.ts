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
