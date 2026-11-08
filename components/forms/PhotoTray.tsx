"use client";
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
 const [notice,setNotice]=useState<string|null>(null),value=useExpertiseActions(),{runtime,items,objects,selected}=value,fr=runtime.locale.startsWith("fr"),assigned=new Set(objects.flatMap(object=>object.uploadIds)),tray=items.filter(item=>!item.uploadId||!assigned.has(item.uploadId)),disabled=runtime.entry.status!=="ready"||runtime.entry.state.phase!=="editing",heading=useId();
 function create(){value.create();onCreated?.();}
 function drop(event:React.DragEvent){if(disabled||!event.dataTransfer.types.includes(expertisePhotosDragType))return;event.preventDefault();try{const ids=JSON.parse(event.dataTransfer.getData(expertisePhotosDragType));if(Array.isArray(ids)&&ids.every(id=>typeof id==="string"))value.assign(null,ids);}catch{setNotice(fr?"Ces photos ne peuvent pas être déplacées. Relisez votre sélection.":"These photos could not be moved. Check your selection.");}}
 return <section className={styles.tray} aria-labelledby={heading} onDragOver={event=>{if(!disabled&&event.dataTransfer.types.includes(expertisePhotosDragType)){event.preventDefault();event.dataTransfer.dropEffect="move";}}} onDrop={drop}>
  <div className={styles.panelHeading}><Typography data-expertise-panel-title tabIndex={-1} component="h3" id={heading}>{fr?"Vos photos":"Your photos"}</Typography><span className={styles.count}>{tray.length} {fr?"à attribuer":"unassigned"}</span></div>
  <Typography className={styles.sectionIntro}>{fr?"Sélectionnez les vues d’un même objet, puis rassemblez-les dans son dossier.":"Select views of the same object, then gather them into its folder."}</Typography>
  <Box sx={{mt:3}}><BatchImageDropzone fieldId={expertisePhotoFieldId} locale={runtime.locale} onChange={ignore} showItems={false} disabled={disabled}/></Box>
  <div className={styles.toolbar}><span className={styles.toolbarCount} aria-live="polite">{selected.length?(fr?`${selected.length} photo(s) sélectionnée(s)`:`${selected.length} selected photo(s)`):(fr?"Sélectionnez vos photos":"Select your photos")}</span><Button type="button" variant={selected.length?"contained":"outlined"} disabled={disabled||objects.length>=10} onClick={create}>{selected.length?(fr?"Créer un objet avec la sélection":"Create object from selection"):(fr?"Ajouter un objet":"Add an object")}</Button>
   {objects.length>0&&<TextField select size="small" fullWidth label={fr?"Déplacer la sélection":"Move selection"} value="" disabled={disabled||!selected.length} slotProps={{select:{SelectDisplayProps:{style:{paddingRight:44}}}}} onChange={event=>value.assign(event.target.value==="tray"?null:event.target.value)}><MenuItem value="tray">{fr?"Photos non attribuées":"Unassigned photos"}</MenuItem>{objects.map((object,index)=><MenuItem key={object.id} value={object.id}>{object.designation||(fr?"Objet ":"Object ")+(index+1)}</MenuItem>)}</TextField>}
  </div>
  {notice&&<Alert severity="error" sx={{mt:2}}>{notice}</Alert>}
  {tray.length?<ul className={styles.photos}>{tray.map(item=><li className={styles.photo} key={item.clientFileId} data-flip-id={"photo-"+(item.uploadId??item.clientFileId)} data-selected={!!item.uploadId&&selected.includes(item.uploadId)} draggable={!!item.uploadId&&!disabled} onDragStart={event=>{if(!item.uploadId)return;event.dataTransfer.effectAllowed="move";event.dataTransfer.setData(expertisePhotosDragType,JSON.stringify(selected.includes(item.uploadId)?selected:[item.uploadId]));}}>
   <UploadItem listItem={false} item={item} locale={runtime.locale} disabled={disabled} onRetry={file=>{try{value.retry(item.clientFileId,file);}catch{setNotice(fr?"Sélectionnez le même fichier pour reprendre cet envoi.":"Select the same file to resume this upload.");}}} onRemove={()=>value.removePhoto(item.clientFileId)}><FormControlLabel sx={{m:0}} label={fr?"Sélectionner":"Select"} control={<Checkbox size="small" disabled={disabled||!item.uploadId||item.serverState==="failed"} checked={!!item.uploadId&&selected.includes(item.uploadId)} slotProps={{input:{"aria-label":(fr?"Sélectionner ":"Select ")+item.name}}} onChange={event=>{if(item.uploadId)value.select(item.uploadId,event.target.checked);}}/>}/></UploadItem>
  </li>)}</ul>:<Box className={styles.empty}><Typography>{items.length?(fr?"Toutes vos photos sont attribuées. Vous pouvez en ajouter ou ouvrir un dossier pour modifier sa sélection.":"All photos have been assigned. Add more or open a folder to change its selection."):(fr?"Ajoutez les premières photos de vos objets.":"Add the first photos of your objects.")}</Typography></Box>}
 </section>;
}
