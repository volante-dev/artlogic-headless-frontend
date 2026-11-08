import type {FormTabState} from "./tab-state";
import {browserFormUploads} from "./browser-uploads";
import type {FormUploadStore} from "./upload-store";
export type FormSessionEntry={status:"loading"}|{status:"error";code:string}|{status:"closed";message:string}|{status:"ready";state:FormTabState};
export class ClosedForm extends Error{constructor(readonly userMessage:string){super("form_closed");}}
const empty:FormSessionEntry={status:"loading"};
/** Created once above removable views; no module-global visitor state or server cache. */
export function createFormSessionStore(){
 const entries=new Map<string,FormSessionEntry>(),pending=new Map<string,Promise<void>>(),listeners=new Set<()=>void>();
 const uploads=new Map<string,FormUploadStore>();let cleanup:ReturnType<typeof setTimeout>|undefined;
 function publish(key:string,entry:FormSessionEntry){entries.set(key,entry);for(const listener of listeners)listener();}
 return {mount(){clearTimeout(cleanup);},unmount(){cleanup=setTimeout(()=>{for(const value of uploads.values())value.dispose();uploads.clear();},0);},uploads(session:FormTabState["session"]){let value=uploads.get(session.sessionId);if(!value){value=browserFormUploads(session);uploads.set(session.sessionId,value);}return value;},subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};},get(key:string){return entries.get(key)??empty;},server(){return empty;},set:publish,reset(key:string){if(pending.has(key))throw new Error("form_request_pending");const previous=entries.get(key);if(previous?.status==="ready"){uploads.get(previous.state.session.sessionId)?.dispose();uploads.delete(previous.state.session.sessionId);}entries.delete(key);for(const listener of listeners)listener();},
  ensure(key:string,load:()=>Promise<FormTabState>){if(pending.has(key)||entries.has(key))return pending.get(key)??Promise.resolve();publish(key,empty);const promise=load().then(state=>{publish(key,{status:"ready",state});},error=>{publish(key,error instanceof ClosedForm?{status:"closed",message:error.userMessage}:{status:"error",code:error instanceof Error?error.message:"form_unavailable"});}).finally(()=>{pending.delete(key);});pending.set(key,promise);return promise;},
 };
}
