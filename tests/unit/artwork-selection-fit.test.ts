import {jsx} from "react/jsx-runtime";
import {it,expect} from "vitest";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {ArtworkSelection} from "../../sections/ArtworkSelection";
import {ClientComponentsProvider} from "../../clients/ClientComponentsProvider";
import {siteVariables} from "../../branding/create-site-theme";
import projection from "../../clients/default/projection.json";
import baseStyles from "../../components/Artwork.module.css";
import tileStyles from "../../components/artworks/ArtworkTile.module.css";
import mediaStyles from "../../components/artworks/ArtworkCardMedia.module.css";
import {ImageGallery} from "../../sections/ImageGallery";
import selectionStyles from "../../sections/ArtworkSelection.module.css";
import sectionStyles from "../../sections/Sections.module.css";
import type {SectionProps} from "../../sections/types";
import type {PresentationTheme} from "../../lib/presentation/types";
const section=(imageFit?:"cover"|"contain"):SectionProps<"artworkSelection">["section"]=>({id:"19000000-0000-4000-8000-000000000001",type:"artworkSelection",schemaVersion:1,variant:"grid",props:{heading:imageFit==="contain"?"Formats d’origine":"Images recadrées",imageFit,artworks:[[900,600],[600,900],[600,600]].map(([width,height],i)=>({id:`19000000-0000-4000-8000-${String(i+2).padStart(12,"0")}`,title:"Œuvre "+(i+1),artist:"Artiste",year:null,medium:null,dimensions:null,media:[{id:"image"+i,path:"/v1/public/media/image"+i,alt:null,width:width!,height:height!}]}))}});
it("defaults page-builder selections to cover and preserves contain across both client profiles",async()=>{
 let html="";for(const profileId of ["default","demo-gallery"]){for(const fit of [undefined,"cover","contain"] as const){const output=renderToStaticMarkup(jsx(ClientComponentsProvider,{profileId,children:createElement(ArtworkSelection,{section:section(fit)})}));expect((output.match(new RegExp('data-image-fit="'+(fit??"cover")+'"','g'))??[]).length).toBe(3);html+='<div data-profile="'+profileId+'" data-fit="'+(fit??"cover")+'">'+output+'</div>';}}
 for(const variant of ["grid","strip"] as const)html+='<div data-section-kind="imageGallery" data-variant="'+variant+'">'+renderToStaticMarkup(createElement(ImageGallery,{section:{id:"gallery-"+variant,type:"imageGallery",schemaVersion:1,variant,props:{heading:"Galerie de recette",items:[0,1,2].map(i=>({id:String(i),image:{id:`19000000-0000-4000-8000-${String(i+10).padStart(12,"0")}`,kind:"image" as const,path:`/v1/public/presentation-assets/19000000-0000-4000-8000-${String(i+10).padStart(12,"0")}`,mimeType:"image/png",width:1200,height:750,byteSize:0}}))}}}))+'</div>';
 const sources=[["../../components/Artwork.module.css",baseStyles],["../../components/artworks/ArtworkTile.module.css",tileStyles],["../../components/artworks/ArtworkCardMedia.module.css",mediaStyles],["../../sections/ArtworkSelection.module.css",selectionStyles],["../../sections/Sections.module.css",sectionStyles]] as const;
 let css="";for(const [path,classes]of sources)css+=(await readFile(new URL(path,import.meta.url),"utf8")).replace(/\.([a-zA-Z_][a-zA-Z_0-9-]*)/g,(text,key)=>classes[key]?"."+classes[key]:text);
 const dir=new URL("../../../backend/.runtime/artwork-fit-proof/",import.meta.url);await mkdir(dir,{recursive:true});await writeFile(new URL("fit.html",dir),'<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;color:var(--site-color-text);background:var(--site-color-background)}a{color:inherit}'+siteVariables(projection as PresentationTheme)+css+'</style><body>'+html+'</body></html>');
});
