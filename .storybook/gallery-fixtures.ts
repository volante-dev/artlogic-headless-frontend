import {fixtureId} from "./section-fixtures";
import type {ArtworkContent} from "../components/artworks/ArtworkInformation";
import type {GalleryCatalog} from "../lib/artworks/types";
export const galleryMedia=[
  {id:fixtureId(501),width:1586,height:992},
  {id:fixtureId(502),width:1254,height:1254},
  {id:fixtureId(503),width:1086,height:1448},
  {id:fixtureId(504),width:1254,height:1254},
  {id:fixtureId(505),width:1122,height:1402},
  {id:fixtureId(506),width:1254,height:1254},
].map(media=>({...media,path:"/v1/public/media/"+media.id,alt:"Objet synthétique de démonstration"}));
export function galleryContent(locale="fr",state:"normal"|"empty"|"long"|"many"|"broken"="normal"):ArtworkContent {
  const en=locale==="en",id=fixtureId(100),description=en?"Demonstration content. An exploration of light and material through layered geometric forms. Smoked glass reveals subtle changes between opacity and transparency.":"Contenu de démonstration. Une exploration de la matière et de la lumière à travers des volumes géométriques superposés. Le verre fumé révèle des nuances subtiles au fil du regard, entre opacité et transparence.";
  return {locale,description:state==="empty"?null:state==="long"?Array(20).fill(description).join("\n\n"):description,descriptionLocale:state==="empty"?null:locale,artwork:{id,slug:"etude-01-"+id.replaceAll("-",""),title:state==="empty"?null:en?"Study 01":"Étude 01",artist:state==="empty"?null:en?"Demonstration content":"Contenu de démonstration",year:state==="empty"?null:"2023",medium:state==="empty"?null:en?"Smoked glass, patinated steel":"Verre fumé, acier patiné",dimensions:state==="empty"?null:"H 85 × L 32 × P 28 cm",media:state==="empty"?[]:state==="broken"?[{...galleryMedia[0]!,id:fixtureId(404),path:"/v1/public/media/"+fixtureId(404)}]:state==="many"?Array.from({length:7},(_,i)=>({...galleryMedia[i%3]!,id:fixtureId(510+i),path:"/v1/public/media/"+fixtureId(510+i)})):galleryMedia.slice(0,3)}};
}
export function galleryCatalog(locale="fr"):GalleryCatalog {
  const content=galleryContent(locale),items=[4,5,6].map((index,i)=>{const id=fixtureId(100+i);return {...content.artwork,id,slug:"etude-0"+(i+1)+"-"+id.replaceAll("-",""),title:locale==="en"?"Study 0"+(i+1):"Étude 0"+(i+1),media:[galleryMedia[index-1]!]};});
  return {items,query:"",page:1,pageSize:3,totalItems:15,pageCount:5,catalogRevision:1};
}
