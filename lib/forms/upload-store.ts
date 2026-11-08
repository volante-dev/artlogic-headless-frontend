import type {components} from "./contract-types.generated";
type Upload=components["schemas"]["FormsUpload"];
type Mime=components["schemas"]["FormsUploadInput"]["mimeType"];
export interface FormUploadItem{clientFileId:string;attempt:number;fieldId:string;name:string;byteSize:number;mimeType:Mime;uploadId?:string;replacesUploadId?:string;serverState?:Upload["state"];phase:"queued"|"authorizing"|"uploading"|"preparing"|"ready"|"failed"|"needs-file"|"removing";progress:number;error?:string}
export interface UploadTransport{
 reserve(input:components["schemas"]["FormsUploadInput"]):Promise<Upload>;
 put(file:File,authorization:NonNullable<Upload["upload"]>,signal:AbortSignal,onProgress:(value:number)=>void):Promise<void>;
 complete(id:string):Promise<Upload>;list():Promise<readonly Upload[]>;remove(id:string):Promise<void>;
}
const mimeTypes=["image/jpeg","image/png","image/webp","image/heic","image/heif"],empty:readonly FormUploadItem[]=[];
/** One instance per form session, owned above removable reader views. Files never enter persisted JSON. */
export function createFormUploadStore(transport:UploadTransport,persist:(items:readonly FormUploadItem[])=>void,initial:readonly FormUploadItem[]=[],uuid:()=>string=()=>crypto.randomUUID()){
 let items:readonly FormUploadItem[]=initial.map(value=>({...value,phase:value.serverState==="ready"?"ready":value.serverState==="uploaded"||value.serverState==="preparing"?"preparing":"needs-file",progress:0})),active=0,disposed=false;
 const files=new Map<string,File>(),controllers=new Map<string,AbortController>(),listeners=new Set<()=>void>();let timer:ReturnType<typeof setTimeout>|undefined,polling=false;
 const previews=new Map<string,{expiresAt:number;url?:string;promise:Promise<{url:string;expiresAt:string}>}>();
 function publish(next:readonly FormUploadItem[]){persist(next);items=next;for(const listener of listeners)listener();}
 function update(id:string,change:Partial<FormUploadItem>){publish(items.map(value=>value.clientFileId===id?{...value,...change}:value));}
 function server(id:string,value:Upload){const old=items.find(item=>item.clientFileId===id);if(!old||old.phase==="removing")return;
  const phase=value.state==="ready"?"ready":value.state==="failed"||value.state==="removed"?"failed":value.state==="authorizing"?"authorizing":value.state==="reserved"?old.phase:"preparing";
  update(id,{uploadId:value.uploadId,serverState:value.state,phase,progress:value.state==="ready"?100:old.progress,error:value.errorCode});if(value.state==="ready")files.delete(id);
 }
 function schedule(delay=1500){if(disposed||timer)return;timer=setTimeout(()=>{timer=undefined;void poll();},delay);}
 async function poll(){
  if(disposed||polling)return;if(typeof document!=="undefined"&&document.hidden){schedule(3000);return;}
  const waiting=items.some(value=>["authorizing","preparing"].includes(value.phase));if(!waiting)return;
  polling=true;try{const values=await transport.list();for(const value of values)if(items.some(item=>item.clientFileId===value.clientFileId&&item.attempt===value.attempt))server(value.clientFileId,value);
   for(const value of items.filter(item=>item.phase==="authorizing"))update(value.clientFileId,{phase:files.has(value.clientFileId)?"queued":"needs-file"});
  }catch{/* Keep current state; an unavailable status never authorizes a new attempt. */}finally{polling=false;pump();if(items.some(value=>["authorizing","preparing"].includes(value.phase)))schedule();}
 }
 async function transfer(item:FormUploadItem){
  const id=item.clientFileId,controller=new AbortController();controllers.set(id,controller);active++;
  try{
   update(id,{phase:"authorizing",error:undefined});const result=await transport.reserve({clientFileId:id,attempt:item.attempt,byteSize:item.byteSize,mimeType:item.mimeType});if(controller.signal.aborted)return;server(id,result);
   if(result.state==="authorizing"){schedule(1000);return;}
   if(result.state!=="reserved"){schedule();return;}
   const file=files.get(id);if(!file){update(id,{phase:"needs-file"});return;}if(!result.upload)throw new Error("upload_authorization_unavailable");
   update(id,{phase:"uploading",progress:0});let transferError:unknown;
   try{await transport.put(file,result.upload,controller.signal,value=>{if(!controller.signal.aborted)update(id,{progress:value});});}catch(error){transferError=error;}
   if(controller.signal.aborted)return;
   // A PUT response may be lost, or return conflict because an earlier PUT succeeded. Confirm first.
   try{server(id,await transport.complete(result.uploadId));}catch(error){throw transferError??error;}
   schedule();
  }catch(error){if(!controller.signal.aborted)update(id,{phase:"failed",error:error instanceof Error?error.message:"upload_unavailable"});}
  finally{controllers.delete(id);active--;pump();}
 }
 function pump(){if(disposed)return;for(const item of items){if(active>=3)break;if(item.phase==="queued"&&!controllers.has(item.clientFileId))void transfer(item);}}
 function retry(id:string,file?:File){const item=items.find(value=>value.clientFileId===id);if(!item||!["failed","needs-file"].includes(item.phase))return;if(file){if(file.size!==item.byteSize||file.type!==item.mimeType)throw new Error("upload_reselection_mismatch");files.set(id,file);}if(!files.has(id)){update(id,{phase:"needs-file"});return;}
   const confirmed=item.serverState==="failed"||item.serverState==="removed";
   if(!confirmed&&item.error==="upload_attempt_expired"){
    update(id,{phase:"removing"});void(async()=>{try{const uploadId=item.uploadId??(await transport.list()).find(value=>value.clientFileId===id&&value.attempt===item.attempt)?.uploadId;if(!uploadId)throw new Error("upload_remove_unconfirmed");await transport.remove(uploadId);if(!items.some(value=>value.clientFileId===id))return;update(id,{phase:"failed",serverState:"removed",error:undefined});retry(id);}catch{update(id,{phase:"failed",error:"upload_remove_unconfirmed"});}})();return;
   }
if(confirmed&&item.attempt>=2147483647)throw new Error("upload_attempt_exhausted");update(id,{attempt:item.attempt+(confirmed?1:0),...(confirmed?{replacesUploadId:item.uploadId??item.replacesUploadId,uploadId:undefined,serverState:undefined}:{}),phase:"queued",error:undefined});pump();
  }

 return {
  subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};},get:()=>items,server:()=>empty,
  add(fieldId:string,selected:readonly File[],maxFiles=50){
   const current=items.filter(item=>item.phase!=="removing"),fieldCount=current.filter(item=>item.fieldId===fieldId).length;
   if(selected.length+current.length>50||selected.length+fieldCount>maxFiles)throw new Error("upload_count_exceeded");
   if(selected.some(file=>file.size<1||file.size>25000000||!mimeTypes.includes(file.type)))throw new Error("upload_invalid_file");
   if(current.reduce((total,item)=>total+item.byteSize,0)+selected.reduce((total,file)=>total+file.size,0)>500000000)throw new Error("upload_bytes_exceeded");
   const additions=selected.map(file=>({clientFileId:uuid(),attempt:1,fieldId,name:file.name,byteSize:file.size,mimeType:file.type as Mime,phase:"queued" as const,progress:0}));
   publish([...items,...additions]);for(let n=0;n<additions.length;n++)files.set(additions[n]!.clientFileId,selected[n]!);pump();
  },
  retry,
  async remove(id:string){const item=items.find(value=>value.clientFileId===id);if(!item)return;controllers.get(id)?.abort();update(id,{phase:"removing"});try{
   // Resolve an interrupted reservation using the same tuple before removing its server resource.
   const value=item.uploadId?null:await transport.reserve({clientFileId:id,attempt:item.attempt,byteSize:item.byteSize,mimeType:item.mimeType});const uploadId=item.uploadId??value?.uploadId;if(uploadId)await transport.remove(uploadId);
   publish(items.filter(value=>value.clientFileId!==id));files.delete(id);
  }catch{update(id,{phase:"failed",error:"upload_remove_unconfirmed"});}},
  pending:(fieldIds?:readonly string[])=>items.some(value=>(!fieldIds||fieldIds.includes(value.fieldId))&&value.phase!=="ready"),
  cachedPreview(id:string){const current=previews.get(id);return current&&current.expiresAt>Date.now()+5000?current.url??null:null;},
  preview(id:string,load:(signal:AbortSignal)=>Promise<{url:string;expiresAt:string}>){
   const existing=previews.get(id);if(existing&&existing.expiresAt>Date.now()+5000)return existing.promise;
   const controller=new AbortController();controllers.set("preview/"+id,controller);const value:{expiresAt:number;url?:string;promise:Promise<{url:string;expiresAt:string}>}={expiresAt:Date.now()+55000,promise:Promise.resolve({url:"",expiresAt:""})};
   value.promise=load(controller.signal).then(result=>{value.expiresAt=Date.parse(result.expiresAt);value.url=result.url;return result;}).catch(error=>{previews.delete(id);throw error;}).finally(()=>controllers.delete("preview/"+id));previews.set(id,value);return value.promise;
  },
  refresh:()=>{void poll();},
  dispose(){disposed=true;clearTimeout(timer);for(const controller of controllers.values())controller.abort();files.clear();previews.clear();listeners.clear();}
 };
}
export type FormUploadStore=ReturnType<typeof createFormUploadStore>;
