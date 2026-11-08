"use client";
import {useEffect,useState,useSyncExternalStore} from "react";
import {Box} from "@mui/material";
import {formRequest} from "@/lib/forms/client";
import {useFormSession} from "./FormSessionProvider";
import {FormIcon} from "./FormIcon";
export function FormPrivateImage({uploadId,alt=""}:{uploadId:string;alt?:string}){
 const {uploads,entry}=useFormSession(),[source,setSource]=useState<{uploadId:string;url:string}|null>(null),session=entry.status==="ready"?entry.state.session:null;if(!uploads)throw new Error("form_image_session_missing");
 const ready=useSyncExternalStore(uploads.subscribe,uploads.get,uploads.server).some(item=>item.uploadId===uploadId&&item.phase==="ready");
 useEffect(()=>{if(!ready||!session)return;let current=true;void uploads.preview(uploadId,signal=>formRequest<{url:string;expiresAt:string}>("sessions/"+session.sessionId+"/uploads/"+uploadId+"/preview",{body:{},capability:session.capability,signal})).then(value=>{if(current)setSource({uploadId,url:value.url});}).catch(()=>{});return()=>{current=false;};},[uploads,session,uploadId,ready]);
 const url=source?.uploadId===uploadId?source.url:uploads.cachedPreview?.(uploadId);
 return url?<Box component="img" src={url} alt={alt} sx={{width:"100%",height:"100%",objectFit:"cover"}}/>:<FormIcon name="image" sx={{fontSize:28}}/>;
}
