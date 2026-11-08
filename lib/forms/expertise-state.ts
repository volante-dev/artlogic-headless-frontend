import type {ExpertiseObject} from "./model.generated";
import {formUuid} from "./definition.generated";
function selectedPhotos(ids:readonly string[],known:readonly string[]){if(new Set(ids).size!==ids.length||ids.some(id=>!formUuid(id)||!known.includes(id)))throw new Error("expertise_unknown_photo");return new Set(ids);}
function positions(objects:readonly ExpertiseObject[]){return objects.map((object,position)=>({...object,position}));}
/** Draft objects may be empty while editing; shared validation applies before the final send. */
export function createExpertiseObject(objects:readonly ExpertiseObject[],selected:readonly string[],known:readonly string[],uuid:()=>string=()=>crypto.randomUUID()):ExpertiseObject[]{
 if(objects.length>=10)throw new Error("expertise_object_limit");selectedPhotos(selected,known);const id=uuid();if(!formUuid(id)||objects.some(object=>object.id===id))throw new Error("expertise_invalid_object");
 const value:ExpertiseObject={id,position:objects.length,designation:"",uploadIds:[],primaryUploadId:""};return moveExpertisePhotos([...objects,value],selected,id,known);
}
export function moveExpertisePhotos(objects:readonly ExpertiseObject[],selected:readonly string[],targetId:string|null,known:readonly string[]):ExpertiseObject[]{
 const moved=selectedPhotos(selected,known);if(targetId!==null&&!objects.some(object=>object.id===targetId))throw new Error("expertise_invalid_object");
 return objects.map(object=>{
  const uploadIds=object.id===targetId?[...object.uploadIds,...selected.filter(id=>!object.uploadIds.includes(id))]:object.uploadIds.filter(id=>!moved.has(id));
  return {...object,uploadIds,primaryUploadId:uploadIds.includes(object.primaryUploadId)?object.primaryUploadId:uploadIds[0]??""};
 });
}
export function removeExpertiseObject(objects:readonly ExpertiseObject[],id:string):ExpertiseObject[]{if(!objects.some(object=>object.id===id))throw new Error("expertise_invalid_object");return positions(objects.filter(object=>object.id!==id));}
export function reorderExpertiseObjects(objects:readonly ExpertiseObject[],order:readonly string[]):ExpertiseObject[]{
 if(order.length!==objects.length||new Set(order).size!==order.length||order.some(id=>!objects.some(object=>object.id===id)))throw new Error("expertise_invalid_order");const byId=new Map(objects.map(object=>[object.id,object]));return positions(order.map(id=>byId.get(id)!));
}
export function selectExpertisePrimary(objects:readonly ExpertiseObject[],id:string,photoId:string):ExpertiseObject[]{
 const target=objects.find(object=>object.id===id);if(!target?.uploadIds.includes(photoId))throw new Error("expertise_primary_must_belong");return objects.map(object=>object.id===id?{...object,primaryUploadId:photoId}:object);
}
export function unassignedExpertisePhotos(objects:readonly ExpertiseObject[],known:readonly string[]){const assigned=new Set(objects.flatMap(object=>object.uploadIds));return known.filter(id=>!assigned.has(id));}
