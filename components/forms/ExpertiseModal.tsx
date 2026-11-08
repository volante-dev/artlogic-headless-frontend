"use client";
import {LoadingIndicator} from "../SiteLoading";
import {useId,useRef,useState} from "react";
import {useFormContext} from "react-hook-form";
import {Alert,Button,Dialog,DialogActions,DialogContent,IconButton,Stack,Typography,useMediaQuery} from "@mui/material";
import type {FormRuntimeValues} from "@/lib/forms/resolver";
import {useEditorialSurface} from "@/components/editorial/immersive/EditorialInteractionProvider";
import {useExpertise} from "./ExpertiseProvider";
import {ExpertiseMotionProvider,useExpertiseChoreography} from "./ExpertiseMotion";
import {PhotoTray} from "./PhotoTray";
import {ObjectBoard} from "./ObjectBoard";
import {ExpertiseObjectStep} from "./ExpertiseObjectStep";
import {ExpertiseContactStep} from "./ExpertiseContactStep";
import {ExpertiseSummary} from "./ExpertiseSummary";
import {FormIcon} from "./FormIcon";
import styles from "./Expertise.module.css";
export function ExpertiseModal(){
 const value=useExpertise(),{runtime,draft,objects,items}=value,methods=useFormContext<FormRuntimeValues>(),fr=runtime.locale.startsWith("fr"),reduced=useMediaQuery("(prefers-reduced-motion: reduce)"),mobile=useMediaQuery("(max-width:599px)"),[mobileTab,setMobileTab]=useState<"photos"|"objects">("photos"),[noticeState,setNoticeState]=useState<{key:string;message:string}|null>(null),content=useRef<HTMLDivElement>(null),root=useRef<HTMLFormElement>(null),id=useId();
 const panelKey=draft.panel+":"+draft.activeObjectId,phase=runtime.entry.status==="ready"?runtime.entry.state.phase:"editing",notice=noticeState?.key===panelKey?noticeState.message:null;
 const layoutKey=objects.map(o=>o.id+":"+o.uploadIds.join(",")).join(";")+"|"+items.map(i=>i.uploadId??i.clientFileId).join(",")+"|"+mobileTab;
 const motion=useExpertiseChoreography(root,content,draft.open,panelKey+":"+phase+(mobile&&draft.panel==="organize"?":"+mobileTab:""),layoutKey,reduced,value.close);
 useEditorialSurface(draft.open);
 function setNotice(message:string|null){setNoticeState(message?{key:panelKey,message}:null);}
 function changeTab(tab:"photos"|"objects",focus=false){if(tab!==mobileTab)motion.navigate(()=>setMobileTab(tab),tab==="objects"?1:-1);if(focus)requestAnimationFrame(()=>document.getElementById(id+"-tab-"+tab)?.focus());}
 if(runtime.entry.status!=="ready")return null;
 const state=runtime.entry.state,editing=phase==="editing",index=Math.max(0,objects.findIndex(object=>object.id===draft.activeObjectId)),assigned=new Set(objects.flatMap(object=>object.uploadIds)),excluded=items.filter(item=>!item.uploadId||!assigned.has(item.uploadId)).length,title=state.session.document.translations[runtime.locale]?.title;
 const stageIndex={organize:0,object:1,contact:2,summary:3}[draft.panel],steps=fr?(mobile?["Photos","Objets","Contact","Résumé"]:["Photos","Objets","Coordonnées","Récapitulatif"]):["Photos","Objects","Contact","Review"];
 function go(panel:typeof draft.panel,objectId?:string|null,direction=1){setNotice(null);motion.navigate(()=>value.panel(panel,objectId),direction);}
 async function next(){setNotice(null);if(!editing)return;
  if(draft.panel==="organize"){
   if(!objects.length){setNotice(fr?"Créez au moins un objet pour continuer.":"Create at least one object to continue.");return;}
   if(objects.some(object=>!object.uploadIds.length)){setNotice(fr?"Chaque objet doit avoir au moins une photo.":"Each object needs at least one photo.");return;}
   go("object",objects[0]!.id);
  }else if(draft.panel==="object"){
   if(!await methods.trigger(`objects.${index}`,{shouldFocus:true})){setNotice(fr?"Complétez les informations signalées pour cet objet.":"Complete the highlighted details for this object.");return;}
   if(index<objects.length-1)go("object",objects[index+1]!.id);else go("contact");
  }else if(draft.panel==="contact"){
   const fields=state.session.document.fields.map(field=>`answers.${field.id}` as const);if(await methods.trigger(fields,{shouldFocus:true}))go("summary");
  }
 }
 function back(){if(draft.panel==="summary")go("contact",undefined,-1);else if(draft.panel==="contact")go("object",objects.at(-1)?.id??null,-1);else if(draft.panel==="object"&&index>0)go("object",objects[index-1]!.id,-1);else go("organize",undefined,-1);}
 const problem=notice??(runtime.notice==="form_upload_pending"?(fr?"Attendez la préparation des photos attribuées avant l’envoi.":"Wait until assigned photos are ready before sending."):runtime.notice&&phase!=="uncertain"?(fr?"La demande n’a pas pu être confirmée. Votre saisie est conservée.":"Your request could not be confirmed. Your entries have been kept."):null);
 return <Dialog className={styles.dialog} open={draft.open} onClose={motion.dismiss} keepMounted fullScreen={mobile} fullWidth maxWidth={false} aria-labelledby={id} transitionDuration={0} slotProps={{paper:{className:styles.paper},backdrop:{sx:{backgroundColor:"rgba(16,19,20,.42)",backdropFilter:"blur(5px)"}}}}>
  <ExpertiseMotionProvider value={motion}><form ref={root} className={styles.root} noValidate onSubmit={event=>{event.preventDefault();if(draft.panel==="summary"){if(excluded>0&&!draft.unassignedExcludedConfirmed){setNotice(fr?"Confirmez l’exclusion des photos non attribuées avant l’envoi.":"Confirm exclusion of unassigned photos before sending.");return;}runtime.submit();}else void next();}} aria-busy={phase==="submitting"}>
   <header className={styles.header} data-expertise-chrome><div className={styles.titleRow}><h2 id={id}>{title}</h2><IconButton className={styles.close} type="button" onClick={motion.dismiss} aria-label={fr?"Fermer la demande":"Close request"}><FormIcon name="close"/></IconButton></div>
    <ol className={styles.progress} aria-label={fr?"Étapes de votre demande":"Request steps"}>{steps.map((label,i)=><li key={label} aria-current={stageIndex===i?"step":undefined} data-current={stageIndex===i} data-complete={stageIndex>i||phase==="accepted"}><span className={styles.stepNumber}>{stageIndex>i||phase==="accepted"?<FormIcon name="ready" sx={{fontSize:17}}/>:String(i+1).padStart(2,"0")}</span><span>{label}{i===1&&draft.panel==="object"?<span className={styles.count}> {index+1}/{objects.length}</span>:null}</span></li>)}</ol>
   </header>
   <DialogContent data-expertise-scroll ref={content} className={styles.content}>
    {problem&&<Alert severity="error" sx={{mb:3}}>{problem}</Alert>}{runtime.notice==="form_restart_failed"&&<Alert severity="error">{fr?"Impossible de reprendre la demande. Votre saisie est conservée ; réessayez.":"We could not resume the request. Your entries are kept; please try again."}</Alert>}
    <div data-expertise-stage className={styles.panelStage}><div key={panelKey} data-expertise-panel className={styles.panel}>
     {phase==="accepted"?<div className={styles.success} role="status"><div className={styles.successMark}><FormIcon name="ready"/></div><Typography component="h3" data-expertise-panel-title tabIndex={-1}>{state.session.document.translations[runtime.locale]?.successMessage}</Typography><Typography sx={{mt:3,color:"text.secondary",overflowWrap:"anywhere"}}>{fr?"Référence":"Reference"} : {state.receipt?.reference}</Typography></div>:phase==="uncertain"?<Stack spacing={3}><Alert severity="warning">{fr?"La réception n’a pas pu être confirmée. Vérifiez l’envoi avant de réessayer ; votre demande est conservée.":"Receipt could not be confirmed. Check the submission before retrying; your request has been kept."}</Alert><Button type="button" variant="contained" onClick={runtime.recover}>{fr?"Vérifier l’envoi":"Check submission"}</Button></Stack>:phase==="expired"?<Alert severity="warning">{fr?"Cette session a expiré. Vos textes et objets sont conservés ; reprenez la demande pour ajouter à nouveau les photos.":"This session has expired. Your text and objects are kept; resume the request to add the photos again."}</Alert>:draft.panel==="organize"?<>
      <div className={styles.mobileTabs} role="tablist" aria-label={fr?"Organisation":"Organization"} onKeyDown={event=>{if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;event.preventDefault();changeTab(event.key==="Home"?"photos":event.key==="End"?"objects":(event.target as HTMLElement).id.endsWith("-objects")?"photos":"objects",true);}}>{(["photos","objects"] as const).map(tab=><button id={id+"-tab-"+tab} key={tab} type="button" role="tab" aria-controls={id+"-panel-"+tab} tabIndex={mobileTab===tab?0:-1} aria-selected={mobileTab===tab} onClick={()=>changeTab(tab)}>{tab==="photos"?(fr?"Photos":"Photos"):(fr?"Objets":"Objects")} · {tab==="photos"?items.length:objects.length}</button>)}</div>
      <div className={styles.organizer}><div id={id+"-panel-photos"} role={mobile?"tabpanel":undefined} aria-labelledby={mobile?id+"-tab-photos":undefined} data-mobile-hidden={mobileTab!=="photos"}><PhotoTray onCreated={()=>{if(mobile)changeTab("objects");}}/></div><div id={id+"-panel-objects"} role={mobile?"tabpanel":undefined} aria-labelledby={mobile?id+"-tab-objects":undefined} data-mobile-hidden={mobileTab!=="objects"}><ObjectBoard/></div></div>
     </>:draft.panel==="object"?<ExpertiseObjectStep/>:draft.panel==="contact"?<ExpertiseContactStep/>:<ExpertiseSummary/>}
    </div></div>
   </DialogContent>
   <DialogActions className={styles.actions} data-expertise-chrome>
    {editing?<><Button type="button" onClick={draft.panel==="organize"?motion.dismiss:back}>{draft.panel==="organize"?(fr?"Reprendre plus tard":"Continue later"):(fr?"Précédent":"Back")}</Button><div className={styles.actionsGroup}><span className={styles.footerHint}>{objects.length} {fr?"objet(s)":"object(s)"} · {assigned.size} {fr?"photo(s)":"photo(s)"}</span>{draft.panel==="object"&&<Button type="button" onClick={()=>go("organize",undefined,-1)}>{fr?"Photos":"Photos"}</Button>}{draft.panel==="summary"?<Button key="expertise-submit" type="submit" variant="contained" disabled={excluded>0&&!draft.unassignedExcludedConfirmed}>{state.session.document.translations[runtime.locale]?.submitLabel??(fr?"Envoyer":"Send")}<FormIcon name="forward"/></Button>:<Button key="expertise-next" type="button" variant="contained" onClick={()=>{void next();}}>{fr?"Continuer":"Continue"}<FormIcon name="forward"/></Button>}</div></>:phase==="submitting"?<Button type="button" variant="contained" disabled startIcon={<LoadingIndicator compact decorative/>}>{fr?"Envoyer":"Send"}</Button>:<><Button type="button" onClick={motion.dismiss}>{fr?"Fermer":"Close"}</Button>{["accepted","expired"].includes(phase)&&<Button type="button" variant="contained" onClick={runtime.restart}>{fr?"Nouvelle demande":"New request"}</Button>}</>}
   </DialogActions>
  </form></ExpertiseMotionProvider>
 </Dialog>;
}
