"use client";
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
import {useId,useState} from "react";
import {Alert,Box,Button,Checkbox,FormControlLabel,MenuItem,TextField,Typography} from "@mui/material";
import {useExpertiseActions} from "./ExpertiseMotion";
import {expertisePhotoFieldId} from "./ExpertiseProvider";
import {BatchImageDropzone} from "./BatchImageDropzone";
import {UploadItem} from "./UploadItem";
import styles from "./Expertise.module.css";
export const expertisePhotosDragType="application/x-artlogic-form-photos";
const ignore=()=>{};
export function PhotoTray({onCreated}:{onCreated?:()=>void}){
 const text=useRuntimeText();
 const [notice,setNotice]=useState<string|null>(null),value=useExpertiseActions(),{runtime,items,objects,selected}=value,assigned=new Set(objects.flatMap(object=>object.uploadIds)),tray=items.filter(item=>!item.uploadId||!assigned.has(item.uploadId)),disabled=runtime.entry.status!=="ready"||runtime.entry.state.phase!=="editing",heading=useId();
 function create(){value.create();onCreated?.();}
 function drop(event:React.DragEvent){if(disabled||!event.dataTransfer.types.includes(expertisePhotosDragType))return;event.preventDefault();try{const ids=JSON.parse(event.dataTransfer.getData(expertisePhotosDragType));if(Array.isArray(ids)&&ids.every(id=>typeof id==="string"))value.assign(null,ids);}catch{setNotice(text("ui.3c6ee5adbde9bdad"));}}
 return <section className={styles.tray} aria-labelledby={heading} onDragOver={event=>{if(!disabled&&event.dataTransfer.types.includes(expertisePhotosDragType)){event.preventDefault();event.dataTransfer.dropEffect="move";}}} onDrop={drop}>
  <div className={styles.panelHeading}><Typography data-expertise-panel-title tabIndex={-1} component="h3" id={heading}>{text("ui.5f0ffe5c831342a9")}</Typography><span className={styles.count}>{tray.length} {text("ui.4a60c095af403b1c")}</span></div>
  <Typography className={styles.sectionIntro}>{text("ui.ccadbc8098e723d3")}</Typography>
  <Box sx={{mt:3}}><BatchImageDropzone fieldId={expertisePhotoFieldId} locale={runtime.locale} onChange={ignore} showItems={false} disabled={disabled}/></Box>
  <div className={styles.toolbar}><span className={styles.toolbarCount} aria-live="polite">{selected.length?(text("ui.3389f88e4ed78201", {value0:String(selected.length)})):(text("ui.987f32658bda519c"))}</span><Button type="button" variant={selected.length?"contained":"outlined"} disabled={disabled||objects.length>=10} onClick={create}>{selected.length?(text("ui.4c4d46af13cd85d6")):(text("ui.8e3d5fb1859c8df5"))}</Button>
   {objects.length>0&&<TextField select size="small" fullWidth label={text("ui.a75f1a8fa1484682")} value="" disabled={disabled||!selected.length} slotProps={{select:{SelectDisplayProps:{style:{paddingRight:44}}}}} onChange={event=>value.assign(event.target.value==="tray"?null:event.target.value)}><MenuItem value="tray">{text("ui.bc755592f3b80aab")}</MenuItem>{objects.map((object,index)=><MenuItem key={object.id} value={object.id}>{object.designation||(text("ui.2da45bd8a3c9d6a1"))+(index+1)}</MenuItem>)}</TextField>}
  </div>
  {notice&&<Alert severity="error" sx={{mt:2}}>{notice}</Alert>}
  {tray.length?<ul className={styles.photos}>{tray.map(item=><li className={styles.photo} key={item.clientFileId} data-flip-id={"photo-"+(item.uploadId??item.clientFileId)} data-selected={!!item.uploadId&&selected.includes(item.uploadId)} draggable={!!item.uploadId&&!disabled} onDragStart={event=>{if(!item.uploadId)return;event.dataTransfer.effectAllowed="move";event.dataTransfer.setData(expertisePhotosDragType,JSON.stringify(selected.includes(item.uploadId)?selected:[item.uploadId]));}}>
   <UploadItem listItem={false} item={item} locale={runtime.locale} disabled={disabled} onRetry={file=>{try{value.retry(item.clientFileId,file);}catch{setNotice(text("ui.16ff70374190da28"));}}} onRemove={()=>value.removePhoto(item.clientFileId)}><FormControlLabel sx={{m:0}} label={text("ui.e6c142fd85fa9f00")} control={<Checkbox size="small" disabled={disabled||!item.uploadId||item.serverState==="failed"} checked={!!item.uploadId&&selected.includes(item.uploadId)} slotProps={{input:{"aria-label":(text("ui.c0ff85d6b611751a"))+item.name}}} onChange={event=>{if(item.uploadId)value.select(item.uploadId,event.target.checked);}}/>}/></UploadItem>
  </li>)}</ul>:<Box className={styles.empty}><Typography>{items.length?(text("ui.44d603ccdaf100b0")):(text("ui.ce533bd9596b6a69"))}</Typography></Box>}
 </section>;
}
