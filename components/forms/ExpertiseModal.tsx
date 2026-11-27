"use client";
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
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
 const text=useRuntimeText();
 const value=useExpertise(),{runtime,draft,objects,items}=value,methods=useFormContext<FormRuntimeValues>(),reduced=useMediaQuery("(prefers-reduced-motion: reduce)"),mobile=useMediaQuery("(max-width:599px)"),[mobileTab,setMobileTab]=useState<"photos"|"objects">("photos"),[noticeState,setNoticeState]=useState<{key:string;message:string}|null>(null),content=useRef<HTMLDivElement>(null),root=useRef<HTMLFormElement>(null),id=useId();
 const panelKey=draft.panel+":"+draft.activeObjectId,phase=runtime.entry.status==="ready"?runtime.entry.state.phase:"editing",notice=noticeState?.key===panelKey?noticeState.message:null;
 const layoutKey=objects.map(o=>o.id+":"+o.uploadIds.join(",")).join(";")+"|"+items.map(i=>i.uploadId??i.clientFileId).join(",")+"|"+mobileTab;
 const motion=useExpertiseChoreography(root,content,draft.open,panelKey+":"+phase+(mobile&&draft.panel==="organize"?":"+mobileTab:""),layoutKey,reduced,value.close);
 useEditorialSurface(draft.open);
 function setNotice(message:string|null){setNoticeState(message?{key:panelKey,message}:null);}
 function changeTab(tab:"photos"|"objects",focus=false){if(tab!==mobileTab)motion.navigate(()=>setMobileTab(tab),tab==="objects"?1:-1);if(focus)requestAnimationFrame(()=>document.getElementById(id+"-tab-"+tab)?.focus());}
 if(runtime.entry.status!=="ready")return null;
 const state=runtime.entry.state,editing=phase==="editing",index=Math.max(0,objects.findIndex(object=>object.id===draft.activeObjectId)),assigned=new Set(objects.flatMap(object=>object.uploadIds)),excluded=items.filter(item=>!item.uploadId||!assigned.has(item.uploadId)).length,title=state.session.document.translations[runtime.locale]?.title;
 const stageIndex={organize:0,object:1,contact:2,summary:3}[draft.panel],steps=[text("forms.expertise.photos"),text("ui.8524a73f17c0c0cd"),text(mobile?"forms.expertise.contactCompact":"forms.expertise.contact"),text(mobile?"forms.expertise.reviewCompact":"forms.expertise.review")];
 function go(panel:typeof draft.panel,objectId?:string|null,direction=1){setNotice(null);motion.navigate(()=>value.panel(panel,objectId),direction);}
 async function next(){setNotice(null);if(!editing)return;
  if(draft.panel==="organize"){
   if(!objects.length){setNotice(text("ui.8ecf06dc65e6e7c6"));return;}
   if(objects.some(object=>!object.uploadIds.length)){setNotice(text("ui.8e3e82c5527ad688"));return;}
   go("object",objects[0]!.id);
  }else if(draft.panel==="object"){
   if(!await methods.trigger(`objects.${index}`,{shouldFocus:true})){setNotice(text("ui.f4606d861055bad1"));return;}
   if(index<objects.length-1)go("object",objects[index+1]!.id);else go("contact");
  }else if(draft.panel==="contact"){
   const fields=state.session.document.fields.map(field=>`answers.${field.id}` as const);if(await methods.trigger(fields,{shouldFocus:true}))go("summary");
  }
 }
 function back(){if(draft.panel==="summary")go("contact",undefined,-1);else if(draft.panel==="contact")go("object",objects.at(-1)?.id??null,-1);else if(draft.panel==="object"&&index>0)go("object",objects[index-1]!.id,-1);else go("organize",undefined,-1);}
 const problem=notice??(runtime.notice==="form_upload_pending"?(text("ui.5f17a6ed9474ee70")):runtime.notice&&phase!=="uncertain"?(text("ui.c0ad5eeab3a26e96")):null);
 return <Dialog className={styles.dialog} open={draft.open} onClose={motion.dismiss} keepMounted fullScreen={mobile} fullWidth maxWidth={false} aria-labelledby={id} transitionDuration={0} slotProps={{paper:{className:styles.paper},backdrop:{sx:{backgroundColor:"rgba(16,19,20,.42)",backdropFilter:"blur(5px)"}}}}>
  <ExpertiseMotionProvider value={motion}><form ref={root} className={styles.root} noValidate onSubmit={event=>{event.preventDefault();if(draft.panel==="summary"){if(excluded>0&&!draft.unassignedExcludedConfirmed){setNotice(text("ui.7a7fd0651d890d75"));return;}runtime.submit();}else void next();}} aria-busy={phase==="submitting"}>
   <header className={styles.header} data-expertise-chrome><div className={styles.titleRow}><h2 id={id}>{title}</h2><IconButton className={styles.close} type="button" onClick={motion.dismiss} aria-label={text("ui.dfd4b1797903273d")}><FormIcon name="close"/></IconButton></div>
    <ol className={styles.progress} aria-label={text("ui.11933abe55f85f91")}>{steps.map((label,i)=><li key={label} aria-current={stageIndex===i?"step":undefined} data-current={stageIndex===i} data-complete={stageIndex>i||phase==="accepted"}><span className={styles.stepNumber}>{stageIndex>i||phase==="accepted"?<FormIcon name="ready" sx={{fontSize:17}}/>:String(i+1).padStart(2,"0")}</span><span>{label}{i===1&&draft.panel==="object"?<span className={styles.count}> {index+1}/{objects.length}</span>:null}</span></li>)}</ol>
   </header>
   <DialogContent data-expertise-scroll ref={content} className={styles.content}>
    {problem&&<Alert severity="error" sx={{mb:3}}>{problem}</Alert>}{runtime.notice==="form_restart_failed"&&<Alert severity="error">{text("ui.4556161b8379bfa8")}</Alert>}
    <div data-expertise-stage className={styles.panelStage}><div key={panelKey} data-expertise-panel className={styles.panel}>
     {phase==="accepted"?<div className={styles.success} role="status"><div className={styles.successMark}><FormIcon name="ready"/></div><Typography component="h3" data-expertise-panel-title tabIndex={-1}>{state.session.document.translations[runtime.locale]?.successMessage}</Typography><Typography sx={{mt:3,color:"text.secondary",overflowWrap:"anywhere"}}>{text("ui.8361d5bf83e8cf50")} : {state.receipt?.reference}</Typography></div>:phase==="uncertain"?<Stack spacing={3}><Alert severity="warning">{text("ui.f2df254756bbcd07")}</Alert><Button type="button" variant="contained" onClick={runtime.recover}>{text("ui.06f7b1e855290d53")}</Button></Stack>:phase==="expired"?<Alert severity="warning">{text("ui.449ca0d3920ce48c")}</Alert>:draft.panel==="organize"?<>
      <div className={styles.mobileTabs} role="tablist" aria-label={text("ui.7b1f15894f16d8d4")} onKeyDown={event=>{if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;event.preventDefault();changeTab(event.key==="Home"?"photos":event.key==="End"?"objects":(event.target as HTMLElement).id.endsWith("-objects")?"photos":"objects",true);}}>{(["photos","objects"] as const).map(tab=><button id={id+"-tab-"+tab} key={tab} type="button" role="tab" aria-controls={id+"-panel-"+tab} tabIndex={mobileTab===tab?0:-1} aria-selected={mobileTab===tab} onClick={()=>changeTab(tab)}>{tab==="photos"?(text("forms.expertise.photos")):(text("ui.8524a73f17c0c0cd"))} · {tab==="photos"?items.length:objects.length}</button>)}</div>
      <div className={styles.organizer}><div id={id+"-panel-photos"} role={mobile?"tabpanel":undefined} aria-labelledby={mobile?id+"-tab-photos":undefined} data-mobile-hidden={mobileTab!=="photos"}><PhotoTray onCreated={()=>{if(mobile)changeTab("objects");}}/></div><div id={id+"-panel-objects"} role={mobile?"tabpanel":undefined} aria-labelledby={mobile?id+"-tab-objects":undefined} data-mobile-hidden={mobileTab!=="objects"}><ObjectBoard/></div></div>
     </>:draft.panel==="object"?<ExpertiseObjectStep/>:draft.panel==="contact"?<ExpertiseContactStep/>:<ExpertiseSummary/>}
    </div></div>
   </DialogContent>
   <DialogActions className={styles.actions} data-expertise-chrome>
    {editing?<><Button type="button" onClick={draft.panel==="organize"?motion.dismiss:back}>{draft.panel==="organize"?(text("ui.b1f03bcbf8b5bac3")):(text("ui.373a94352525900c"))}</Button><div className={styles.actionsGroup}><span className={styles.footerHint}>{objects.length} {text("ui.67034b4049267f9c")} · {assigned.size} {text("forms.expertise.photoUnit")}</span>{draft.panel==="object"&&<Button type="button" onClick={()=>go("organize",undefined,-1)}>{text("forms.expertise.photos")}</Button>}{draft.panel==="summary"?<Button key="expertise-submit" type="submit" variant="contained" disabled={excluded>0&&!draft.unassignedExcludedConfirmed}>{state.session.document.translations[runtime.locale]?.submitLabel??(text("ui.2c069ebaa3178287"))}<FormIcon name="forward"/></Button>:<Button key="expertise-next" type="button" variant="contained" onClick={()=>{void next();}}>{text("commerce.continue")}<FormIcon name="forward"/></Button>}</div></>:phase==="submitting"?<Button type="button" variant="contained" disabled startIcon={<LoadingIndicator compact decorative/>}>{text("ui.2c069ebaa3178287")}</Button>:<><Button type="button" onClick={motion.dismiss}>{text("commerce.close")}</Button>{["accepted","expired"].includes(phase)&&<Button type="button" variant="contained" onClick={runtime.restart}>{text("ui.4af521a649a32cab")}</Button>}</>}
   </DialogActions>
  </form></ExpertiseMotionProvider>
 </Dialog>;
}
