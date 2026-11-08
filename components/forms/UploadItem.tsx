"use client";
import {LoadingIndicator} from "../SiteLoading";
import {useRef,type ReactNode} from "react";
import {Box,Button,LinearProgress,Stack,Typography} from "@mui/material";
import type {FormUploadItem} from "@/lib/forms/upload-store";
import {FormPrivateImage} from "./FormPrivateImage";
import {FormIcon} from "./FormIcon";
export function UploadItem({item,locale,disabled,onRetry,onRemove,children,listItem=true}:{item:FormUploadItem;locale:string;disabled:boolean;onRetry:(file?:File)=>void;onRemove:()=>void;children?:ReactNode;listItem?:boolean}){
 const fr=locale.startsWith("fr"),input=useRef<HTMLInputElement>(null);
 const failed=item.phase==="failed"||item.phase==="needs-file",pending=!["failed","needs-file","ready"].includes(item.phase);
 const label=item.phase==="ready"?(fr?"Prête":"Ready"):item.phase==="uploading"?item.progress+" %":item.phase==="needs-file"?(fr?"Sélectionnez à nouveau ce fichier":"Select this file again"):failed?(fr?"L’image n’a pas pu être préparée":"The image could not be prepared"):(fr?"Préparation":"Preparing");
 return <Box data-upload-card component={listItem?"li":"div"} sx={{listStyle:"none",border:"1px solid",borderColor:failed?"error.main":"divider",minWidth:0}}>
  <Box sx={{aspectRatio:"4 / 3",display:"grid",placeItems:"center",backgroundColor:"action.hover",overflow:"hidden"}}>{item.phase==="ready"&&item.uploadId?<FormPrivateImage uploadId={item.uploadId}/>:pending?<LoadingIndicator compact label={label}/>:<FormIcon name={failed?"error":"ready"} sx={{fontSize:28}}/>}</Box>
  <Stack data-upload-body spacing={1} sx={{p:1.5}}><Typography title={item.name} sx={{fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</Typography><Typography data-upload-status role="status" color={failed?"error":"text.secondary"} sx={{fontSize:12,minHeight:"2.6em"}}>{label}</Typography>{item.phase==="uploading"&&<LinearProgress variant="determinate" value={item.progress} aria-label={fr?"Transfert":"Upload"}/>}
   <Stack data-upload-actions direction="row" sx={{flexWrap:"wrap",gap:.5}}>{failed&&<Button type="button" size="small" disabled={disabled} onClick={()=>item.phase==="needs-file"?input.current?.click():onRetry()}>{fr?"Réessayer":"Retry"}</Button>}<Button type="button" size="small" disabled={disabled||item.phase==="removing"} onClick={onRemove} aria-label={(fr?"Retirer ":"Remove ")+item.name}>{fr?"Retirer":"Remove"}</Button></Stack>
   {children}
   <input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={event=>{const file=event.target.files?.[0];event.target.value="";if(file)onRetry(file);}}/>
  </Stack>
 </Box>;
}
