import {fixtureId} from "./section-fixtures";
import type {ArtworkContent} from "../components/artworks/ArtworkInformation";
export type MobileFixture="normal"|"empty"|"one"|"many"|"broken"|"long-title";
export function mobileGalleryContent(locale="fr",kind:MobileFixture="normal"):ArtworkContent{
 const en=locale==="en",media=[601,602,603].map(id=>({id:fixtureId(id),path:"/v1/public/media/"+fixtureId(id),width:1536,height:1024,alt:en?"Synthetic carved object, demonstration":"Objet sculpté synthétique de démonstration"}));
 const description=en?"Synthetic demonstration object. A study of carved volumes and elongated lines. No historical attribution.":"Objet synthétique de démonstration. Une étude de volumes sculptés et de lignes élancées. Aucune attribution historique.";
 return {locale,description:Array(12).fill(description).join("\n\n"),descriptionLocale:locale,artwork:{id:fixtureId(817),slug:"etude-synthetique-0817-"+fixtureId(817).replaceAll("-",""),title:kind==="long-title"?Array(7).fill(en?"A study of elongated carved forms":"Une étude de formes sculptées élancées").join(" — "):en?"Synthetic study 0817":"Étude synthétique 0817",artist:en?"Test artist 19":"Artiste de test 19",year:"2023",medium:en?"Carved wood — synthetic demonstration":"Bois sculpté — démonstration synthétique",dimensions:"H 85 cm",media:kind==="empty"?[]:kind==="one"?media.slice(0,1):kind==="broken"?[{...media[0]!,id:fixtureId(640)}]:kind==="many"?Array.from({length:10},(_,i)=>({...media[i%3]!,id:fixtureId(620+i),path:"/v1/public/media/"+fixtureId(620+i)})):media}};
}
