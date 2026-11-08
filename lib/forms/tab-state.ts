import type {components} from "./contract-types.generated";
import type {ExpertiseObject} from "./model.generated";
import type {FormRuntimeValues} from "./resolver";
import {projectFormAnswers} from "./projection";
import {validateFormDefinition} from "./definition.generated";
type Session=components["schemas"]["FormsSessionCreated"];
type Payload=components["schemas"]["FormsSubmissionInput"];
type Receipt=components["schemas"]["FormsReceipt"];
export interface ExpertiseTabDraft{objects:ExpertiseObject[];panel:"organize"|"object"|"contact"|"summary";activeObjectId:string|null;selectedUploadIds:string[];open:boolean;unassignedExcludedConfirmed:boolean}
export interface FormTabState{expertise?:ExpertiseTabDraft;schemaVersion:1;session:Session;locale:string;step:number;answers:FormRuntimeValues["answers"];submissionProof:string;phase:"editing"|"submitting"|"uncertain"|"accepted"|"expired";attempt:{proof:string;payload:Payload}|null;receipt:Receipt|null}
export function formTabKey(formId:string,placement:components["schemas"]["FormsPlacement"]){return "artlogic:forms:v1:"+JSON.stringify([placement.ownerType,placement.ownerId,placement.blockId??null,formId,...(placement.artworkId?[placement.artworkId]:[])]);}
export function createFormTabState(session:Session,locale:string,random:()=>Uint8Array=()=>crypto.getRandomValues(new Uint8Array(32))):FormTabState{
 const bytes=random();if(bytes.length!==32||!session.document.translations[locale])throw new Error("form_tab_state_invalid");
 return {...(session.document.kind==="expertise"?{expertise:{objects:[],panel:"organize" as const,activeObjectId:null,selectedUploadIds:[],open:false,unassignedExcludedConfirmed:false}}:{}),schemaVersion:1,session:structuredClone(session),locale,step:0,answers:{},submissionProof:Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join(""),phase:"editing",attempt:null,receipt:null};
}
/** An expired capability cannot authorize old uploads. Retain only compatible non-image input. */
export function resumeExpiredFormState(previous:FormTabState,fresh:FormTabState):FormTabState{
 if(previous.phase!=="expired"||fresh.phase!=="editing"||previous.session.sessionId===fresh.session.sessionId)throw new Error("form_expiry_resume_invalid");
 const oldFields=new Map(previous.session.document.fields.map(field=>[field.id,field]));
 const answers:FormTabState["answers"]={};
 for(const field of fresh.session.document.fields){if(field.type!=="images"&&oldFields.get(field.id)?.type===field.type&&Object.hasOwn(previous.answers,field.id))answers[field.id]=structuredClone(previous.answers[field.id]!);}
 const expertise=previous.expertise&&fresh.expertise?{...fresh.expertise,open:true,objects:previous.expertise.objects.map(object=>({...structuredClone(object),uploadIds:[],primaryUploadId:""}))}:fresh.expertise;
 return {...fresh,answers,step:Math.min(previous.step,Math.max(0,fresh.session.document.steps.length-1)),...(expertise?{expertise}:{})};
}
export function updateFormTabState(state:FormTabState,change:Partial<Pick<FormTabState,"locale"|"step"|"answers"|"phase"|"receipt"|"expertise">>):FormTabState{return {...state,...change};}
export function beginFormSubmission(state:FormTabState):FormTabState{
 if(state.phase!=="editing")throw new Error("form_submission_requires_resolution");
 return {...state,phase:"submitting",attempt:{proof:state.submissionProof,payload:{locale:state.locale,versionId:state.session.versionId,answers:structuredClone(projectFormAnswers(state.session.document,state.answers)) as Payload["answers"],...(state.expertise?{objects:state.expertise.objects.map(object=>({...structuredClone(object),uploadIds:[...object.uploadIds]}))}:{}),unassignedExcludedConfirmed:state.expertise?.unassignedExcludedConfirmed??false}}};
}
export function saveFormTabState(storage:Pick<Storage,"setItem">,key:string,state:FormTabState){try{const value=JSON.stringify(state);if(value.length>4_000_000)throw new Error();storage.setItem(key,value);}catch{throw new Error("form_tab_storage_unavailable");}}
export function loadFormTabState(storage:Pick<Storage,"getItem">,key:string):FormTabState|null{
 let raw:string|null;try{raw=storage.getItem(key);}catch{throw new Error("form_tab_storage_unavailable");}if(raw===null)return null;
 try{
  if(raw.length>4_000_000)throw new Error();const value=JSON.parse(raw) as FormTabState;
  if(value.schemaVersion!==1||!value.session||!/^[0-9a-f-]{36}$/i.test(value.session.sessionId)||!/^[0-9a-f-]{36}$/i.test(value.session.versionId)||!/^[A-Za-z0-9_-]{43}$/.test(value.session.capability)||!/^[0-9a-f]{64}$/.test(value.submissionProof)||!Number.isFinite(Date.parse(value.session.expiresAt))||!["editing","submitting","uncertain","accepted","expired"].includes(value.phase)||!Number.isInteger(value.step)||value.step<0||!value.answers||Array.isArray(value.answers)||typeof value.answers!=="object"||!value.session.document.translations[value.locale]||validateFormDefinition(value.session.document,Object.keys(value.session.document.translations)).length)throw new Error();
  if(value.session.document.kind==="expertise"&&(!value.expertise||!Array.isArray(value.expertise.objects)||value.expertise.objects.length>10||value.expertise.objects.some(object=>!object||typeof object.id!=="string"||!/^[0-9a-f-]{36}$/i.test(object.id)||typeof object.designation!=="string"||object.designation.length>256||!Array.isArray(object.uploadIds)||object.uploadIds.length>50||typeof object.primaryUploadId!=="string")||!["organize","object","contact","summary"].includes(value.expertise.panel)||!Array.isArray(value.expertise.selectedUploadIds)||value.expertise.selectedUploadIds.length>50||typeof value.expertise.open!=="boolean"||typeof value.expertise.unassignedExcludedConfirmed!=="boolean"))throw new Error();
  if(value.phase==="accepted"&&(!value.receipt||typeof value.receipt.reference!=="string"||!Number.isFinite(Date.parse(value.receipt.acceptedAt))))throw new Error();
  if(["submitting","uncertain","accepted"].includes(value.phase)&&(!value.attempt||value.attempt.proof!==value.submissionProof||value.attempt.payload.versionId!==value.session.versionId))throw new Error();
  // A terminated browser request has an unknown outcome, not permission to send a new payload.
  return value.phase==="submitting"?{...value,phase:"uncertain"}:value;
 }catch{throw new Error("form_tab_state_invalid");}
}

/** Keep receipt recovery separate from the draft offered on a new visit. */
export function archiveAcceptedFormState(storage:Pick<Storage,"setItem"|"removeItem">,key:string,state:FormTabState){
 if(state.phase!=="accepted"||!state.receipt)throw new Error("form_receipt_not_confirmed");
 try{storage.setItem("artlogic:forms:receipt:v1:"+state.session.sessionId,JSON.stringify({sessionId:state.session.sessionId,submissionProof:state.submissionProof,receipt:state.receipt}));storage.removeItem(key);}catch{throw new Error("form_tab_storage_unavailable");}
}
export function loadResumableFormTabState(storage:Pick<Storage,"getItem"|"setItem"|"removeItem">,key:string):FormTabState|null{
 const state=loadFormTabState(storage,key);if(state?.phase!=="accepted")return state;
 archiveAcceptedFormState(storage,key,state);return null;
}
