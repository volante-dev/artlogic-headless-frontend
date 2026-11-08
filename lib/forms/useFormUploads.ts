"use client";
import {useEffect,useRef,useSyncExternalStore} from "react";
import {useFormSession} from "@/components/forms/FormSessionProvider";
export function useFormUploads(fieldId:string,onChange:(ids:string[])=>void){
 const {uploads}=useFormSession();if(!uploads)throw new Error("form_upload_session_missing");
 const all=useSyncExternalStore(uploads.subscribe,uploads.get,uploads.server),items=all.filter(value=>value.fieldId===fieldId),ready=items.filter(value=>value.phase==="ready"&&value.uploadId).map(value=>value.uploadId!),signature=ready.join(","),change=useRef(onChange);
 useEffect(()=>{change.current=onChange;},[onChange]);
 useEffect(()=>{change.current(signature?signature.split(","):[]);},[signature]);
 useEffect(()=>{uploads.refresh();const refresh=()=>{if(!document.hidden)uploads.refresh();};document.addEventListener("visibilitychange",refresh);return()=>document.removeEventListener("visibilitychange",refresh);},[uploads]);
 return {items,add:(files:readonly File[],maxFiles:number)=>uploads.add(fieldId,files,maxFiles),retry:uploads.retry,remove:uploads.remove};
}
