import type {GalleryExperience} from "../artworks/types";
import type {PublicContactArtwork} from "./types";
export function isContactArtworkId(value:string|null):value is string{return Boolean(value&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));}
/** Use the same published visibility and translations as the artwork modal. */
export function contactArtworkFromExperience(experience:GalleryExperience,untitled:string,defaultLocale:string):PublicContactArtwork{
 const {artwork:art,locale,heroFocus}=experience,photo=art.media[0];
 return {id:art.id,title:art.title??untitled,url:(locale===defaultLocale?"":"/"+locale)+"/artworks/"+art.id,artist:art.artist,year:art.year,medium:art.medium,dimensions:art.dimensions,
  photo:photo?{id:photo.id,alt:photo.alt,width:photo.width,height:photo.height}:null,focalPoint:heroFocus&&heroFocus.mediaId===photo?.id?{x:heroFocus.x,y:heroFocus.y}:null};
}
