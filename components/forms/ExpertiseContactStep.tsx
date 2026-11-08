"use client";
import {Typography} from "@mui/material";
import {useExpertise} from "./ExpertiseProvider";
import {FormField} from "./FormField";
import styles from "./Expertise.module.css";
export function ExpertiseContactStep(){const {runtime}=useExpertise();if(runtime.entry.status!=="ready")return null;const fr=runtime.locale.startsWith("fr");return <div className={styles.contact}><Typography data-expertise-panel-title tabIndex={-1} component="h3" variant="h4">{fr?"Vos coordonnées":"Your contact details"}</Typography><Typography className={styles.sectionIntro}>{fr?"Ces coordonnées sont communes à tous les objets de votre demande.":"These contact details apply to all objects in your request."}</Typography><div className={styles.contactFields}>{runtime.entry.state.session.document.fields.map(field=><FormField key={field.id} field={field} locale={runtime.locale} inert={runtime.entry.status!=="ready"||runtime.entry.state.phase!=="editing"}/>)}</div></div>;}
