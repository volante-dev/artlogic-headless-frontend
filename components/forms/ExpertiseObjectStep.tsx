"use client";
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
import {Controller,useFormContext} from "react-hook-form";
import {Alert,Box,TextField,Typography} from "@mui/material";
import type {FormRuntimeValues} from "@/lib/forms/resolver";
import {useExpertise} from "./ExpertiseProvider";
import styles from "./Expertise.module.css";
import {FormPrivateImage} from "./FormPrivateImage";
const fields=[{key:"designation",messageId:"ui.8afdb6925824e46c",max:256,required:true},{key:"description",messageId:"forms.expertise.description",max:20000,multiline:true},{key:"artistOrCulture",messageId:"ui.d400cc660e6e46d6",max:256},{key:"period",messageId:"ui.19c9aefbd7d1eba4",max:256},{key:"materials",messageId:"ui.f064b66698d33712",max:1000},{key:"dimensions",messageId:"forms.expertise.dimensions",max:1000},{key:"provenance",messageId:"forms.expertise.provenance",max:20000,multiline:true}] as const;
export function ExpertiseObjectStep(){
 const text=useRuntimeText();
 const {objects,draft,runtime}=useExpertise(),{control}=useFormContext<FormRuntimeValues>(),index=Math.max(0,objects.findIndex(object=>object.id===draft.activeObjectId)),object=objects[index],disabled=runtime.entry.status!=="ready"||runtime.entry.state.phase!=="editing";
 if(!object)return <Alert severity="info">{text("ui.dc22549f5bf02890")}</Alert>;
 return <Box className={styles.objectDetail}>
  <Box className={styles.objectPreview}><Box className={styles.objectPreviewImage}>{object.primaryUploadId?<FormPrivateImage uploadId={object.primaryUploadId}/>:<Typography sx={{p:3}}>{text("ui.cdaa06464d69c3e9")}</Typography>}</Box><Typography className={styles.photoCaption}>{text("ui.65a6e7e15aede2c3", {value0:String(object.uploadIds.length)})}</Typography></Box>
  <Box><Typography data-expertise-panel-title tabIndex={-1} component="h3" variant="h4">{text("ui.7d55bb61c28faaa9")}</Typography><Typography className={styles.sectionIntro}>{text("ui.35e848c9d5ffc082")}</Typography><div className={styles.fields}>{fields.map(definition=><Box key={definition.key} data-wide={definition.key==="designation"||"multiline" in definition}><Controller control={control} name={`objects.${index}.${definition.key}`} render={({field,fieldState})=><TextField name={field.name} inputRef={field.ref} value={field.value??""} onBlur={field.onBlur} onChange={field.onChange} label={text(definition.messageId)} fullWidth required={"required" in definition&&definition.required} disabled={disabled} error={!!fieldState.error} helperText={fieldState.error?.message??(definition.key==="dimensions"?(text("ui.8bbf4b0776f6c574")):undefined)} multiline={"multiline" in definition} minRows={"multiline" in definition?3:undefined} slotProps={{htmlInput:{maxLength:definition.max,style:{boxSizing:"content-box"}}}}/>}/></Box>)}</div>{!object.uploadIds.length&&<Alert severity="error">{text("ui.1fc09e805e060410")}</Alert>}</Box>
 </Box>;
}
