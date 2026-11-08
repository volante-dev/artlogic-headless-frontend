"use client";
import {createContext,useContext,useEffect,useCallback,useRef,useSyncExternalStore,type ReactNode} from "react";
import {useFieldArray,useFormContext,useWatch} from "react-hook-form";
import type {ExpertiseObject} from "@/lib/forms/model.generated";
import type {FormRuntimeValues} from "@/lib/forms/resolver";
import {createExpertiseObject,moveExpertisePhotos,removeExpertiseObject,reorderExpertiseObjects,selectExpertisePrimary,unassignedExpertisePhotos} from "@/lib/forms/expertise-state";
import {useFormSession} from "./FormSessionProvider";
export const expertisePhotoFieldId="20000000-0000-4000-8000-000000000002";
function useController(){
 const runtime=useFormSession(),methods=useFormContext<FormRuntimeValues>(),array=useFieldArray({control:methods.control,name:"objects",keyName:"rhfKey"}),watched=useWatch({control:methods.control,name:"objects"}),objects=(watched??[]) as ExpertiseObject[],trigger=useRef<HTMLButtonElement>(null);
 if(runtime.entry.status!=="ready"||!runtime.entry.state.expertise||!runtime.uploads)throw new Error("expertise_session_missing");
 const registerTrigger=useCallback((element:HTMLButtonElement|null)=>{trigger.current=element;},[]);
 const draft=runtime.entry.state.expertise,uploads=runtime.uploads,items=useSyncExternalStore(uploads.subscribe,uploads.get,uploads.server),known=items.filter(item=>item.uploadId&&!["failed","removed","attached"].includes(item.serverState??"")).map(item=>item.uploadId!),selected=draft.selectedUploadIds,unassigned=unassignedExpertisePhotos(objects,known);
 useEffect(()=>{uploads.refresh();},[uploads]);
 const current=()=>methods.getValues().objects??[];
 function applyPhotos(next:readonly ExpertiseObject[]){next.forEach((object,index)=>{methods.setValue(`objects.${index}.uploadIds`,object.uploadIds,{shouldDirty:true});methods.setValue(`objects.${index}.primaryUploadId`,object.primaryUploadId,{shouldDirty:true});});runtime.updateExpertise({objects:[...next],selectedUploadIds:[],unassignedExcludedConfirmed:false});}
 useEffect(()=>{
  const replacements=new Map(items.filter(item=>item.uploadId&&item.replacesUploadId).map(item=>[item.replacesUploadId!,item.uploadId!]));
  const values=methods.getValues().objects??[];if(!values.some(object=>object.uploadIds.some(id=>replacements.has(id))))return;
  values.forEach((object,index)=>{methods.setValue(`objects.${index}.uploadIds`,object.uploadIds.map(id=>replacements.get(id)??id));methods.setValue(`objects.${index}.primaryUploadId`,replacements.get(object.primaryUploadId)??object.primaryUploadId);});runtime.updateExpertise({objects:values.map(object=>({...object,uploadIds:object.uploadIds.map(id=>replacements.get(id)??id),primaryUploadId:replacements.get(object.primaryUploadId)??object.primaryUploadId})),unassignedExcludedConfirmed:false});
 },[items,methods,runtime.updateExpertise]);
 return {runtime,draft,objects,items,known,selected,unassigned,registerTrigger,keys:array.fields.map(field=>field.rhfKey),
  open(){runtime.updateExpertise({open:true});},close(){runtime.updateExpertise({open:false});requestAnimationFrame(()=>trigger.current?.focus({preventScroll:true}));},
  select(id:string,checked:boolean){runtime.updateExpertise({selectedUploadIds:checked?[...new Set([...selected,id])]:selected.filter(value=>value!==id)});},
  create(){const values=current(),next=createExpertiseObject(values,selected,known);applyPhotos(next.slice(0,-1));array.append(next.at(-1)!);runtime.updateExpertise({objects:[...next],selectedUploadIds:[],unassignedExcludedConfirmed:false});},
  assign(targetId:string|null,photos:readonly string[]=selected){applyPhotos(moveExpertisePhotos(current(),photos,targetId,known));},
  removeObject(id:string){const values=current(),index=values.findIndex(object=>object.id===id),next=removeExpertiseObject(values,id);array.remove(index);next.forEach((object,n)=>methods.setValue(`objects.${n}.position`,object.position));runtime.updateExpertise({objects:[...next],selectedUploadIds:[],unassignedExcludedConfirmed:false});},
  reorder(id:string,direction:-1|1){const values=current(),index=values.findIndex(object=>object.id===id),target=index+direction;if(index<0||target<0||target>=values.length)return;const order=values.map(object=>object.id);[order[index],order[target]]=[order[target]!,order[index]!];const next=reorderExpertiseObjects(values,order);array.move(index,target);next.forEach((object,n)=>methods.setValue(`objects.${n}.position`,object.position));runtime.updateExpertise({objects:next,unassignedExcludedConfirmed:false});},
  primary(id:string,photoId:string){applyPhotos(selectExpertisePrimary(current(),id,photoId));},
  removePhoto(clientId:string){const item=items.find(value=>value.clientFileId===clientId);if(item?.uploadId){const values=current().map(object=>{const uploadIds=object.uploadIds.filter(id=>id!==item.uploadId);return {...object,uploadIds,primaryUploadId:uploadIds.includes(object.primaryUploadId)?object.primaryUploadId:uploadIds[0]??""};});applyPhotos(values);}void uploads.remove(clientId);},
  retry:uploads.retry,
  panel(panel:typeof draft.panel,activeObjectId:string|null=draft.activeObjectId){runtime.updateExpertise({panel,activeObjectId});},
 };
}
type Value=ReturnType<typeof useController>;
const Context=createContext<Value|null>(null);
export function ExpertiseProvider({children}:{children:ReactNode}){const value=useController();return <Context value={value}>{children}</Context>;}
export function useExpertise(){const value=useContext(Context);if(!value)throw new Error("expertise_provider_missing");return value;}
