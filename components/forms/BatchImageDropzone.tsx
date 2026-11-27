"use client";
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
import {useRef,useState} from "react";
import {Alert,Box,Typography} from "@mui/material";
import {useFormUploads} from "@/lib/forms/useFormUploads";
import {UploadItem} from "./UploadItem";
import {FormIcon} from "./FormIcon";
export function BatchImageDropzone({fieldId,locale,onChange,maxFiles=50,disabled=false,labelledBy,onSelected,showItems=true}:{fieldId:string;locale:string;onChange:(ids:string[])=>void;maxFiles?:number;disabled?:boolean;labelledBy?:string;onSelected?:()=>void;showItems?:boolean}){
 const text=useRuntimeText();
 const {items,add,retry,remove}=useFormUploads(fieldId,onChange),input=useRef<HTMLInputElement>(null),[dragging,setDragging]=useState(false),[error,setError]=useState<string|null>(null);
 function failure(value:unknown){const code=value instanceof Error?value.message:"";setError(code==="upload_count_exceeded"?(text("ui.138b2f2662a8935f", {maxFiles:String(maxFiles)})):code==="upload_bytes_exceeded"?(text("ui.bad6170f52ecda74")):code==="upload_reselection_mismatch"?(text("ui.16ff70374190da28")):(text("ui.abda3a229c42aaa6")));}
 function select(files:FileList|readonly File[]|null){if(disabled||!files)return;setError(null);try{const normalized=Array.from(files).map(file=>!file.type&&/\.hei[cf]$/i.test(file.name)?new File([file],file.name,{type:/\.heif$/i.test(file.name)?"image/heif":"image/heic",lastModified:file.lastModified}):file);add(normalized,maxFiles);if(normalized.length)onSelected?.();}catch(value){failure(value);}}
 return <Box sx={{mt:1.5}}>
  <Box data-form-dropzone data-dragging={dragging} component="button" type="button" disabled={disabled} aria-describedby={labelledBy} onClick={()=>input.current?.click()} onDragOver={event=>{event.preventDefault();if(!disabled)setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={event=>{event.preventDefault();event.stopPropagation();setDragging(false);select(event.dataTransfer.files);}} style={{display:"block",background:dragging?"var(--site-color-mutedSurface)":"transparent",color:"inherit"}} sx={{width:"100%",minHeight:156,p:3,border:"1px dashed",borderColor:dragging?"primary.main":"divider",cursor:disabled?"default":"pointer",font:"inherit",textAlign:"center",touchAction:"manipulation","&:focus-visible":{outline:"2px solid",outlineColor:"primary.main",outlineOffset:4},"&:disabled":{opacity:.6}}}>
   <FormIcon name="add" sx={{fontSize:28,mb:1.5}}/><Typography component="span" sx={{display:"block"}}>{text("ui.5b0362b601d17271")}</Typography><Typography component="span" sx={{display:"block",fontSize:13,color:"text.secondary",mt:1}}>{text("ui.39a65ec935cf71e4")}</Typography>
  </Box>
  <input ref={input} hidden type="file" multiple disabled={disabled} accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={event=>{select(event.target.files);event.target.value="";}}/>
  {error&&<Alert severity="error" sx={{mt:2}}>{error}</Alert>}
  {showItems&&!!items.length&&<Box component="ul" sx={{display:"grid",gridTemplateColumns:{xs:"repeat(2,minmax(0,1fr))",md:"repeat(3,minmax(0,1fr))"},p:0,mt:2,gap:1.5}}>{items.map(item=><UploadItem key={item.clientFileId} item={item} locale={locale} disabled={disabled} onRetry={file=>{try{setError(null);retry(item.clientFileId,file);}catch(value){failure(value);}}} onRemove={()=>{void remove(item.clientFileId);}}/>)}</Box>}
 </Box>;
}
