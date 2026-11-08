import type {Artwork} from "../lib/api/artworks";
import type {PresentationAsset,PresentationSection} from "../lib/presentation/types";
import type {PageData} from "../sections/types";
import {sectionDefinitions} from "../page-composer/definitions";

export type FixtureState="normal"|"long"|"empty"|"posterError"|"videoError"|"reducedMotion";
export type SectionType=PresentationSection["type"];
export const fixtureId=(index:number)=>`00000000-0000-4000-8000-${String(index).padStart(12,"0")}`;
export const poster:PresentationAsset={id:fixtureId(1),kind:"image",path:"/v1/public/presentation-assets/"+fixtureId(1),mimeType:"image/webp",width:1200,height:750,byteSize:0};
export const film:PresentationAsset={id:fixtureId(2),kind:"video",path:"/v1/public/presentation-assets/"+fixtureId(2),mimeType:"video/mp4",width:1200,height:750,byteSize:0};
export function artworkFixture(locale="fr",state:FixtureState="normal",index=0):Artwork{
  const en=locale==="en",empty=state==="empty",title=en?"Study of a form — synthetic artwork":"Étude d’une forme — œuvre synthétique";
  return {id:fixtureId(100+index),title:empty?null:state==="long"?Array(4).fill(title).join(" — "):title,artist:empty?null:en?"Demonstration collection":"Collection de démonstration",year:empty?null:"2026",medium:empty?null:en?"Synthetic image, no attribution":"Image synthétique, sans attribution",dimensions:empty?null:"120 × 75 cm",media:empty?[]:[{id:fixtureId(3),path:"/v1/public/media/"+fixtureId(3),width:1200,height:750,alt:en?"Synthetic sculptural form":"Forme sculpturale synthétique"}]};
}
export const catalogEntries=sectionDefinitions.flatMap(definition=>[
  ...definition.variants.map(variant=>({type:definition.type,variant,state:"normal" as FixtureState})),
  ...(["long","empty"] as const).map(state=>({type:definition.type,variant:definition.variants[0],state})),
  ...(definition.type==="heroMedia"?(["posterError","videoError","reducedMotion"] as const).map(state=>({type:definition.type,variant:definition.variants[0],state})):[]),
]);
export function sectionFixture(type:SectionType,variant:string,state:FixtureState="normal",locale="fr"):{section:PresentationSection;data:PageData}{
  const en=locale==="en",empty=state==="empty",long=state==="long";
  const title=en?"A space for looking":"Un espace pour regarder",sentence=en?"Demonstration content for testing composition, translation and reading rhythm. No real exhibition or artist is represented.":"Contenu de démonstration pour tester la composition, la traduction et le rythme de lecture. Aucune exposition ni aucun artiste réel n’est représenté.";
  const heading=empty?undefined:long?Array(4).fill(title).join(" — "):title,body=empty?undefined:Array(long?8:1).fill(sentence).join("\n\n");
  const link={kind:"page",pageKey:"contact"} as const,linkLabel=en?"Contact the gallery":"Contacter la galerie";
  const image=empty?null:state==="posterError"?{...poster,id:fixtureId(404),path:"/v1/public/presentation-assets/"+fixtureId(404)}:poster;
  const video=empty||state==="posterError"?null:state==="videoError"?{...film,path:"/v1/public/presentation-assets/"+fixtureId(405)}:film;
  const artworks=empty?[]:Array.from({length:3},(_,index)=>artworkFixture(locale,state,index));
  const data:PageData={catalog:{kind:"legacy",page:{items:artworks,nextCursor:null,catalogRevision:1,restarted:false}},artwork:artworkFixture(locale,state)};
  const common={id:fixtureId(10),schemaVersion:1 as const};
  const alt=en?"Synthetic sculptural form":"Forme sculpturale synthétique",caption=en?"Synthetic image · demonstration":"Image synthétique · démonstration";
  const items=empty?[]:Array.from({length:3},(_,i)=>({id:fixtureId(20+i),heading,excerpt:body,link,image,alt,caption}));
  // This exhaustive map is checked against the actual generated public section union.
  const sections:{[T in SectionType]:Extract<PresentationSection,{type:T}>}={
    form:{...common,type:"form",variant:"default",props:{formId:fixtureId(801)}},formImage:{...common,type:"formImage",variant:"default",props:{formId:fixtureId(801),imageSide:"right",image:null}},heroMedia:{...common,type:"heroMedia",variant:"immersive",props:{heading,introduction:empty?undefined:long?sentence:en?"Discover the demonstration collection.":"Découvrir la collection de démonstration.",link,linkLabel,poster:image,video}},
    text:{...common,type:"text",variant:"standard",props:empty?{}:{heading,body,link,linkLabel}},
    textImage:{...common,type:"textImage",variant:"imageLeft",props:empty?{}:{heading,body,link,linkLabel,image,alt,caption}},
    articleSelection:{...common,type:"articleSelection",variant:"grid",props:{heading,introduction:body,articles:empty?[]:Array.from({length:3},(_,i)=>({id:fixtureId(400+i),kind:i%2?"news":"publication",canonicalPath:(en?"/en":"")+"/publications/etude-"+i,title:heading??title,summary:body??null,editorialDate:"2026-10-30",cover:i===2?null:{srcPath:"/media/"+fixtureId(3),alt},authors:[{id:fixtureId(500),name:en?"Demonstration editorial team":"Équipe éditoriale de démonstration",hasProfile:false}]}))}},
    artworkSelection:{...common,type:"artworkSelection",variant:"grid",props:{heading,introduction:body,artworks}},
    editorialCards:{...common,type:"editorialCards",variant:"grid",props:{heading,introduction:body,items}},
    imageGallery:{...common,type:"imageGallery",variant:"grid",props:{heading,items}},
    contact:{...common,type:"contact",variant:"compact",props:empty?{}:{heading,body,links:[{id:fixtureId(30),label:en?"Write to the gallery":"Écrire à la galerie",destination:{kind:"email",value:"gallery@example.invalid"}}]}},
    artworkCatalog:{...common,type:"artworkCatalog",variant:"grid",props:{columns:3}},
    artworkDetails:{...common,type:"artworkDetails",variant:"standard",props:{}},
  };
  const section=sections[type],definition=sectionDefinitions.find(d=>d.type===type)!;
  if(!(definition.variants as readonly string[]).includes(variant))throw new Error("invalid_story_variant");
  return {section:{...section,variant} as PresentationSection,data};
}
