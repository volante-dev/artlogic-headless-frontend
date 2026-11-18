import type {GalleryCatalog} from "../../lib/artworks/types";
export function infiniteCatalogPage(page=1,query=""):GalleryCatalog{
 const id=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,"0")}`;
 return {display:"plp",layout:"masonry",query,page,pageSize:18,totalItems:54,pageCount:3,catalogRevision:1,items:Array.from({length:18},(_,i)=>{
  const index=(page-1)*18+i,artId=id(1000+index),mediaId=id(504+index%3);
  return {id:artId,slug:"etude-"+artId.replaceAll("-",""),title:"Étude "+(index+1),artist:"Collection de démonstration",year:null,medium:null,dimensions:null,catalogLarge:false,media:[{id:mediaId,path:"/v1/public/media/"+mediaId,width:1254,height:1254,alt:"Objet de démonstration"}]};
 })};
}
