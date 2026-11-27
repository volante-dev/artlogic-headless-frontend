"use client";
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
import {LoadingIndicator} from "../SiteLoading";
import {useRef,type ReactNode} from "react";
import {Box,Button,LinearProgress,Stack,Typography} from "@mui/material";
import type {FormUploadItem} from "@/lib/forms/upload-store";
import {FormPrivateImage} from "./FormPrivateImage";
import {FormIcon} from "./FormIcon";
export function UploadItem({item,locale,disabled,onRetry,onRemove,children,listItem=true}:{item:FormUploadItem;locale:string;disabled:boolean;onRetry:(file?:File)=>void;onRemove:()=>void;children?:ReactNode;listItem?:boolean}){
 const text=useRuntimeText(locale);
 const input=useRef<HTMLInputElement>(null);
 const failed=item.phase==="failed"||item.phase==="needs-file",pending=!["failed","needs-file","ready"].includes(item.phase);
 const label=item.phase==="ready"?(text("ui.9b157c09e2013c01")):item.phase==="uploading"?item.progress+" %":item.phase==="needs-file"?(text("ui.ec5db058a2b94e6a")):failed?(text("ui.db2f64b3f052b11d")):(text("ui.477cf47d83a54e78"));
 return <Box data-upload-card component={listItem?"li":"div"} sx={{listStyle:"none",border:"1px solid",borderColor:failed?"error.main":"divider",minWidth:0}}>
  <Box sx={{aspectRatio:"4 / 3",display:"grid",placeItems:"center",backgroundColor:"action.hover",overflow:"hidden"}}>{item.phase==="ready"&&item.uploadId?<FormPrivateImage uploadId={item.uploadId}/>:pending?<LoadingIndicator compact label={label}/>:<FormIcon name={failed?"error":"ready"} sx={{fontSize:28}}/>}</Box>
  <Stack data-upload-body spacing={1} sx={{p:1.5}}><Typography title={item.name} sx={{fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</Typography><Typography data-upload-status role="status" color={failed?"error":"text.secondary"} sx={{fontSize:12,minHeight:"2.6em"}}>{label}</Typography>{item.phase==="uploading"&&<LinearProgress variant="determinate" value={item.progress} aria-label={text("ui.1f67925950a74bd0")}/>}
   <Stack data-upload-actions direction="row" sx={{flexWrap:"wrap",gap:.5}}>{failed&&<Button type="button" size="small" disabled={disabled} onClick={()=>item.phase==="needs-file"?input.current?.click():onRetry()}>{text("ui.39535ae98eaa105a")}</Button>}<Button type="button" size="small" disabled={disabled||item.phase==="removing"} onClick={onRemove} aria-label={(text("ui.9e35288e4f357660"))+item.name}>{text("commerce.remove")}</Button></Stack>
   {children}
   <input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={event=>{const file=event.target.files?.[0];event.target.value="";if(file)onRetry(file);}}/>
  </Stack>
 </Box>;
}
