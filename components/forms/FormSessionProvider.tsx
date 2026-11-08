"use client";
import {createContext,useContext,useEffect,useState,useSyncExternalStore,useCallback,useRef,type ReactNode} from "react";
import {FormProvider,useForm} from "react-hook-form";
import type {components} from "@/lib/forms/contract-types.generated";
import {createFormSessionStore,ClosedForm,type FormSessionEntry} from "@/lib/forms/session-store";
import {formTabKey,createFormTabState,resumeExpiredFormState,loadResumableFormTabState,archiveAcceptedFormState,saveFormTabState,updateFormTabState,beginFormSubmission,type ExpertiseTabDraft,type FormTabState} from "@/lib/forms/tab-state";
import {formAnswersResolver,formAnswerIssuePath,type FormRuntimeValues} from "@/lib/forms/resolver";
import {formRequest,PublicFormError} from "@/lib/forms/client";
import {useFormExecutionMode,type FormExecutionMode} from "@/lib/forms/execution";
import {visibleFormFields} from "@/lib/forms/conditions.generated";
import type {FormUploadStore} from "@/lib/forms/upload-store";
type Store=ReturnType<typeof createFormSessionStore>;
const StoreContext=createContext<Store|null>(null);
export function FormSessionsProvider({children}:{children:ReactNode}){const[store]=useState(createFormSessionStore);useEffect(()=>{store.mount();return()=>store.unmount();},[store]);return <StoreContext value={store}>{children}</StoreContext>;}
interface Runtime{updateExpertise:(change:Partial<ExpertiseTabDraft>)=>void;uploads:FormUploadStore|null;entry:FormSessionEntry;inert:boolean;locale:string;notice:string|null;submit:()=>void;recover:()=>void;restart:()=>void;step:(index:number)=>void}
const Context=createContext<Runtime|null>(null);
export function useFormSession(){const value=useContext(Context);if(!value)throw new Error("form_session_provider_missing");return value;}
export function FormSessionProvider({formId,placement,locale,mode="live",children}:{formId:string;placement:components["schemas"]["FormsPlacement"];locale:string;mode?:FormExecutionMode;children:ReactNode}){
 const inherited=useContext(StoreContext),[local]=useState(createFormSessionStore),store=inherited??local,key=formTabKey(formId,placement),inert=useFormExecutionMode(mode)==="inert",entry=useSyncExternalStore(store.subscribe,()=>store.get(key),store.server);
 const[restartNotice,setRestartNotice]=useState<string|null>(null);
 const initialize=async(fresh=false)=>{const stored=fresh?null:loadResumableFormTabState(sessionStorage,key);if(stored){store.uploads(stored.session);return stored;}const query=new URLSearchParams({locale,ownerType:placement.ownerType,ownerId:placement.ownerId,...(placement.blockId?{blockId:placement.blockId}:{}),...(placement.artworkId?{artworkId:placement.artworkId}:{})}),published=await formRequest<components["schemas"]["FormsPublic"]>(formId+"?"+query);if(published.availability==="closed")throw new ClosedForm(published.closedMessage??(locale.startsWith("fr")?"Ce formulaire est fermé.":"This form is closed."));if(published.availability!=="open")throw new PublicFormError("form_unavailable");const session=await formRequest<components["schemas"]["FormsSessionCreated"]>(formId+"/sessions",{body:{locale,placement}}),state=createFormTabState(session,locale);store.uploads(state.session);saveFormTabState(sessionStorage,key,state);return state;};
 const initializeRef=useRef(initialize);useEffect(()=>{initializeRef.current=initialize;},[initialize]);
 useEffect(()=>{if(inert)return;
  try{const previous=store.get(key);if(previous.status==="ready"&&previous.state.phase==="accepted"){archiveAcceptedFormState(sessionStorage,key,previous.state);store.reset(key);}
   void store.ensure(key,()=>initializeRef.current());
  }catch{store.set(key,{status:"error",code:"form_tab_storage_unavailable"});}
 },[key,inert,store]);
 if(inert||entry.status!=="ready")return <Context value={{updateExpertise(){},uploads:null,entry,inert,locale,notice:entry.status==="error"?entry.code:null,submit(){},recover(){},restart(){},step(){}}}>{children}</Context>;
 function restart(){
  if(entry.status!=="ready"||!["accepted","expired"].includes(entry.state.phase))return;
  const previous=entry.state;setRestartNotice(null);
  try{
   if(previous.phase==="accepted")sessionStorage.setItem("artlogic:forms:receipt:v1:"+previous.session.sessionId,JSON.stringify({sessionId:previous.session.sessionId,submissionProof:previous.submissionProof,receipt:previous.receipt}));
   store.reset(key);
   void store.ensure(key,async()=>{try{const fresh=await initialize(true),next=previous.phase==="expired"?resumeExpiredFormState(previous,fresh):fresh;saveFormTabState(sessionStorage,key,next);return next;}catch{saveFormTabState(sessionStorage,key,previous);setRestartNotice("form_restart_failed");return previous;}});
  }catch{setRestartNotice("form_restart_failed");store.set(key,{status:"ready",state:previous});}
 }
 return <BoundSession key={entry.state.session.sessionId} entry={entry} store={store} storageKey={key} locale={locale} blockId={placement.blockId} restartNotice={restartNotice} restart={restart}>{children}</BoundSession>;
}
function BoundSession({entry,store,storageKey,locale,children,restart,blockId,restartNotice}:{entry:Extract<FormSessionEntry,{status:"ready"}>;store:Store;storageKey:string;locale:string;children:ReactNode;restart:()=>void;blockId?:string;restartNotice:string|null}){
 const state=entry.state,uploads=store.uploads(state.session),[notice,setNotice]=useState<string|null>(null),methods=useForm<FormRuntimeValues>({defaultValues:{answers:state.answers,objects:state.expertise?.objects??[]},resolver:formAnswersResolver(state.session.document,locale),shouldUnregister:false,mode:"onSubmit"});
 const uploadItems=useSyncExternalStore(uploads.subscribe,uploads.get,uploads.server);
 const fallback=useRef(state);fallback.current=state;
 const current=useCallback(()=>{const value=store.get(storageKey);return value.status==="ready"?value.state:fallback.current;},[store,storageKey]);
 const commit=useCallback((next:FormTabState)=>{try{saveFormTabState(sessionStorage,storageKey,next);store.set(storageKey,{status:"ready",state:next});return true;}catch{setNotice("form_tab_storage_unavailable");return false;}},[store,storageKey]);
 useEffect(()=>{if(uploadItems.some(item=>item.error==="form_session_expired")){const value=current();if(value.phase==="editing"){commit(updateFormTabState(value,{phase:"expired"}));setNotice("form_session_expired");}}},[uploadItems,current,commit]);
 useEffect(()=>{const value=current();if(value.locale!==locale&&value.session.document.translations[locale])commit(updateFormTabState(value,{locale}));},[locale,current,commit]);
 useEffect(()=>{const subscription=methods.watch(values=>{const value=current();commit(updateFormTabState(value,{answers:values.answers as FormRuntimeValues["answers"],...(value.expertise?{expertise:{...value.expertise,objects:(values.objects??value.expertise.objects) as ExpertiseTabDraft["objects"],unassignedExcludedConfirmed:false}}:{})}));});return()=>subscription.unsubscribe();},[methods,current,commit]);
 async function send(pending:FormTabState){
  if(!pending.attempt)return;setNotice(null);
  try{const receipt=await formRequest<components["schemas"]["FormsReceipt"]>("sessions/"+pending.session.sessionId+"/submit",{body:pending.attempt.payload,capability:pending.session.capability,proof:pending.attempt.proof});commit(updateFormTabState(current(),{phase:"accepted",receipt}));}
  catch(error){
   if(error instanceof PublicFormError&&error.status<500){const next=updateFormTabState(current(),{phase:error.status===410?"expired":"editing"});commit({...next,attempt:null});for(const issue of error.issues){if(issue.fieldId)methods.setError(`answers.${issue.fieldId}`,{type:issue.code,message:locale.startsWith("fr")?"Vérifiez ce champ.":"Check this field."},{shouldFocus:true});else if(issue.objectId){const path=formAnswerIssuePath(issue,current().expertise?.objects??[]);if(path.startsWith("objects."))methods.setError(path as `objects.${number}.designation`,{type:issue.code,message:locale.startsWith("fr")?"Vérifiez cet objet.":"Check this object."},{shouldFocus:true});}}setNotice(error.code);}
   else{commit(updateFormTabState(current(),{phase:"uncertain"}));setNotice("form_confirmation_unknown");}
  }
 }
 const submit=methods.handleSubmit(async values=>{const value=current();if(value.phase!=="editing")return;if(value.expertise?uploads.get().some(item=>item.uploadId&&(values.objects??[]).some(object=>object.uploadIds.includes(item.uploadId!))&&item.phase!=="ready"):uploads.pending(visibleFormFields(value.session.document,values.answers))){setNotice("form_upload_pending");return;}const pending=beginFormSubmission(updateFormTabState(value,{answers:values.answers,locale,...(value.expertise?{expertise:{...value.expertise,objects:values.objects??[]}}:{})}));if(commit(pending))await send(pending);});
 async function recover(){
  const value=current();if(!value.attempt||!["uncertain","submitting"].includes(value.phase))return;setNotice(null);
  try{const receipt=await formRequest<components["schemas"]["FormsReceipt"]>("receipts/recover",{body:{sessionId:value.session.sessionId,submissionProof:value.submissionProof},proof:value.submissionProof});commit(updateFormTabState(value,{phase:"accepted",receipt}));}
  catch(error){
   if(error instanceof PublicFormError&&error.status===404){
    try{const session=await formRequest<components["schemas"]["FormsSession"]>("sessions/"+value.session.sessionId,{capability:value.session.capability});if(session.state!=="open"||Date.parse(session.expiresAt)<=Date.now())throw new PublicFormError("form_session_expired",[],410);const pending=updateFormTabState(value,{phase:"submitting"});if(commit(pending))await send(pending);}
    catch(next){if(next instanceof PublicFormError&&next.status===410)commit(updateFormTabState(value,{phase:"expired"}));setNotice(next instanceof PublicFormError?next.code:"form_confirmation_unknown");}
   }else setNotice("form_confirmation_unknown");
  }
 }
 return <Context value={{updateExpertise:change=>{const value=current();if(value.expertise)commit(updateFormTabState(value,{expertise:{...value.expertise,...change}}));},uploads,entry,inert:false,locale,notice:notice??restartNotice,submit:()=>{void submit();},recover:()=>{void recover();},restart,step:index=>{if(commit(updateFormTabState(current(),{step:index})))requestAnimationFrame(()=>{const scope=blockId?document.getElementById(blockId):null,host=scope?.closest<HTMLElement>("[data-editorial-scroll-host]"),field=scope?.querySelector<HTMLElement>("input:not([type=hidden]):not([disabled]),textarea:not([disabled]),select:not([disabled])");if(host)host.scrollTop=0;field?.focus({preventScroll:!!host});});}}}><FormProvider {...methods}>{children}</FormProvider></Context>;
}
