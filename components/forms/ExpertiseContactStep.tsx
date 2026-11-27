"use client";
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
import {Typography} from "@mui/material";
import {useExpertise} from "./ExpertiseProvider";
import {FormField} from "./FormField";
import styles from "./Expertise.module.css";
export function ExpertiseContactStep(){
 const text=useRuntimeText();const {runtime}=useExpertise();if(runtime.entry.status!=="ready")return null;return <div className={styles.contact}><Typography data-expertise-panel-title tabIndex={-1} component="h3" variant="h4">{text("ui.06e43ad59e533955")}</Typography><Typography className={styles.sectionIntro}>{text("ui.13d1ac6ea9e16a5f")}</Typography><div className={styles.contactFields}>{runtime.entry.state.session.document.fields.map(field=><FormField imageUploadLabel={text("ui.06dca37aef2862d5")} key={field.id} field={field} locale={runtime.locale} inert={runtime.entry.status!=="ready"||runtime.entry.state.phase!=="editing"}/>)}</div></div>;}
