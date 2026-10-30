"use client";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {useSiteContent} from "../SiteContentProvider";
import {setContactDraft,clearContactProof,contactRequest,ContactClientError,newContactProof,readContactProof,storeContactProof,type StoredContactProof} from "../../lib/contact/client";
import type {ContactFormProps,ContactReceipt as Receipt} from "../../lib/contact/types";
import {useClientComponents} from "../../clients/ClientComponentsProvider";
import {useContactExecutionMode} from "../../lib/contact/execution";
type Values={name:string;email:string;subject:string;message:string};
export function ContactForm({configuration,artwork=null,contextUnavailable=false,mode:requestedMode,headingLevel="h1"}:ContactFormProps){
 const mode=useContactExecutionMode(requestedMode);
 const {messages:m,locale}=useSiteContent(),[values,setValues]=useState<Values>({name:"",email:"",subject:artwork?m["contact.artworkSubject"]:"",message:""}),[selected,setSelected]=useState(artwork),[contextRejected,setContextRejected]=useState(contextUnavailable),[website,setWebsite]=useState("");
 const [hasProof,setHasProof]=useState(false),[pending,setPending]=useState(false),[restoring,setRestoring]=useState(mode!=="inert"),[receipt,setReceipt]=useState<Receipt|null>(null),[notice,setNotice]=useState<string|null>(null),[errors,setErrors]=useState<Record<string,string>>({}),[retryAfter,setRetryAfter]=useState<number|undefined>();
 const proof=useRef<StoredContactProof|null>(null),lastPayload=useRef<string|null>(null),errorRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(mode==="inert")return;let current=true;async function restore(){const saved=readContactProof();if(saved){proof.current=saved;setHasProof(true);try{const result=await contactRequest("receipt",{proof:saved.proof});if(current)setReceipt(result);}catch{if(current)setNotice("unknownReceipt");}}if(current)setRestoring(false);}void restore();return()=>{current=false;};},[mode]);
 useEffect(()=>{setContactDraft(!receipt&&Object.values(values).some(Boolean));return()=>setContactDraft(false);},[values,receipt]);
 useEffect(()=>{if(notice||Object.keys(errors).length)errorRef.current?.focus();},[notice,errors]);
 const fieldError=(reason:string)=>reason==="required"?m["contact.requiredError"]:reason==="too_long"?m["contact.tooLong"]:m["contact.invalid"];
 function beginNew(){if(!receipt&&notice&&!window.confirm(m["contact.newConfirm"]))return;clearContactProof();proof.current=null;setHasProof(false);lastPayload.current=null;setReceipt(null);setNotice(null);setErrors({});setValues({name:"",email:"",subject:selected?m["contact.artworkSubject"]:"",message:""});}
 async function recover(){if(!proof.current||mode==="inert")return;setPending(true);setNotice(null);try{setReceipt(await contactRequest("receipt",{proof:proof.current.proof}));}catch{setNotice("unknownReceipt");}finally{setPending(false);}}
 async function submit(event:FormEvent){
  event.preventDefault();if(mode==="inert"||pending||!configuration?.enabled||contextRejected)return;
  const next:Record<string,string>={};for(const [field,max]of [["name",120],["email",254],["subject",160],["message",5000]]as const){if(!values[field].trim())next[field]=m["contact.requiredError"];else if(Array.from(values[field].trim()).length>max)next[field]=m["contact.tooLong"];}
  if(values.email&&!/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(values.email.trim()))next.email=m["contact.invalidEmail"];
  setErrors(next);if(Object.keys(next).length){setNotice("invalid");return;}
  const content={...values,locale,website,...(selected?{artworkId:selected.id}:{})},serialized=JSON.stringify(content);
  if(lastPayload.current&&lastPayload.current!==serialized){setNotice("conflict");return;}
  proof.current??=newContactProof();storeContactProof(proof.current);setHasProof(true);lastPayload.current=serialized;setPending(true);setNotice(null);setRetryAfter(undefined);
  try{const result=await contactRequest("inquiries",{...content,proof:proof.current.proof});proof.current={...proof.current,reference:result.reference};storeContactProof(proof.current);setReceipt(result);}
  catch(error){const e=error instanceof ContactClientError?error:new ContactClientError("contact_unavailable");setRetryAfter(e.retryAfter);setErrors(Object.fromEntries(e.fields.filter(v=>["name","email","subject","message"].includes(v.field)).map(v=>[v.field,fieldError(v.reason)])));if(e.code==="not_found"&&selected){setContextRejected(true);setNotice("artworkUnavailable");}else setNotice(({validation_error:"invalid",rate_limited:"rateLimited",idempotency_conflict:"conflict",contact_disabled:"disabled"}as Record<string,string>)[e.code]??"unavailable");}
  finally{setPending(false);}
 }
 const {ContactForm:View}=useClientComponents();
 return <View configuration={configuration} artwork={artwork} contextUnavailable={contextUnavailable} mode={mode} headingLevel={headingLevel} values={values} selected={selected} contextRejected={contextRejected} website={website} pending={pending} restoring={restoring} receipt={receipt} notice={notice} errors={errors} retryAfter={retryAfter} hasProof={hasProof} errorRef={errorRef} onSubmit={event=>void submit(event)} onNew={beginNew} onRecover={()=>void recover()} onGeneral={()=>{setSelected(null);setContextRejected(false);setNotice(null);proof.current=null;setHasProof(false);lastPayload.current=null;clearContactProof();const url=new URL(window.location.href);url.searchParams.delete("artwork");window.history.replaceState(null,"",url);}} onField={(field,value)=>setValues(v=>({...v,[field]:value}))} onWebsite={setWebsite}/>;
}
