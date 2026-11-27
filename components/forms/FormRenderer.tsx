"use client";
import {hasRuntimeModule} from "@/lib/i18n/site-messages";
import {useSiteContent} from "../SiteContentProvider";
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
import {useWatch,useFormContext} from "react-hook-form";
import {Box,Stack} from "@mui/material";
import {visibleFormFields} from "@/lib/forms/conditions.generated";
import {isFormTitleHidden} from "@/lib/forms/definition.generated";
import type {FormRuntimeValues} from "@/lib/forms/resolver";
import {useFormSession} from "./FormSessionProvider";
import {FormField} from "./FormField";
import {BatchImageDropzone} from "./BatchImageDropzone";
import {ExpertiseRenderer} from "./ExpertiseRenderer";
import {FormSteps} from "./FormSteps";
import {useClientComponents} from "@/clients/ClientComponentsProvider";
import type {FormAnimation} from "./FormEntrance";
export function FormRenderer({animation="form-fade",hideTitle=false}:{animation?:FormAnimation|false;hideTitle?:boolean}={}){
 const site=useSiteContent();
 const runtime=useFormSession(),{Form:View}=useClientComponents(),{entry}=runtime;
 if(!hasRuntimeModule(site.messages,runtime.locale,"forms"))return <p role="status">{site.messages["error.presentationMessage"]}</p>;
 if(runtime.inert)return <View phase="inert" locale={runtime.locale} onSubmit={runtime.submit} onRecover={runtime.recover} onRestart={runtime.restart}/>;
 if(entry.status!=="ready")return <View phase={entry.status} locale={runtime.locale} notice={entry.status==="closed"?entry.message:undefined} onSubmit={runtime.submit} onRecover={runtime.recover} onRestart={runtime.restart}/>;
 const titleHidden=isFormTitleHidden(entry.state.session.document,hideTitle);
 if(entry.state.session.document.kind==="expertise")return <ExpertiseRenderer animation={animation} hideTitle={titleHidden}/>;
 return <ActiveForm animation={animation} hideTitle={titleHidden}/>;
}
function ActiveForm({animation,hideTitle}:{animation:FormAnimation|false;hideTitle:boolean}){
 const text=useRuntimeText();
 const runtime=useFormSession(),{Form:View}=useClientComponents(),{control}=useFormContext<FormRuntimeValues>(),answers=useWatch({control,name:"answers"});if(runtime.entry.status!=="ready")return null;
 const state=runtime.entry.state,doc=state.session.document,translation=doc.translations[runtime.locale],index=Math.min(state.step,doc.steps.length-1),visible=new Set(visibleFormFields(doc,answers)),fields=doc.fields.filter(field=>field.stepId===doc.steps[index]?.id&&visible.has(field.id)),rows=[...new Set(fields.map(field=>field.rowId))],pending=state.phase!=="editing";
 if(!translation)return <View phase="error" locale={runtime.locale} notice={text("ui.773c8c25264f8c39")} onSubmit={runtime.submit} onRecover={runtime.recover} onRestart={runtime.restart}/>;
 const notice=runtime.notice||state.phase==="expired"?runtime.notice==="form_restart_failed"?(text("ui.4556161b8379bfa8")):runtime.notice==="form_upload_pending"?(text("ui.fd5b670cf2dd86a0")):runtime.notice==="form_confirmation_unknown"?(text("ui.2d3501718d7ee51b")):runtime.notice==="form_session_expired"||state.phase==="expired"?(text("ui.e424ecdaaa96fdc2")):(text("ui.b25c1e8c5f5556ee")):null;
 const body=<Stack spacing={3}>{rows.map(row=><Box data-form-entrance-group key={row} sx={{display:"grid",gridTemplateColumns:{xs:"minmax(0,1fr)",md:"repeat(2,minmax(0,1fr))"},gap:3}}>{fields.filter(field=>field.rowId===row).sort((a,b)=>a.column-b.column).map(field=><Box key={field.id} sx={{gridColumn:{xs:"1 / -1",md:fields.filter(item=>item.rowId===row).length===1?"1 / -1":String(field.column)},minWidth:0}}><FormField imageUploadLabel={text("ui.06dca37aef2862d5")} field={field} locale={runtime.locale} inert={pending} images={({onChange,labelId})=><BatchImageDropzone labelledBy={labelId} fieldId={field.id} locale={runtime.locale} onChange={onChange} maxFiles={field.constraints.maxFiles??50} disabled={pending}/>}/></Box>)}</Box>)}</Stack>;
 return <View hideTitle={hideTitle} phase={state.phase} locale={runtime.locale} title={translation.title} intro={translation.intro} successMessage={translation.successMessage} notice={notice} reference={state.receipt?.reference} body={body} stepNavigation={<FormSteps document={doc} locale={runtime.locale} index={index} onChange={runtime.step} pending={pending}/>} animation={animation} onSubmit={runtime.submit} onRecover={runtime.recover} onRestart={runtime.restart}/>;
}
