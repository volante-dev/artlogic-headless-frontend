import type {components} from "./contract-types.generated";
import {formRequest} from "./client";
import {createFormUploadStore,type FormUploadItem,type UploadTransport} from "./upload-store";
type Session=components["schemas"]["FormsSessionCreated"];
export function browserFormUploads(session:Session){
 const path="sessions/"+session.sessionId,key="artlogic:forms:uploads:v1:"+session.sessionId,capability=session.capability;
 let initial:FormUploadItem[]=[];
 const raw=sessionStorage.getItem(key);if(raw){
  if(raw.length>262144)throw new Error("form_tab_state_invalid");const value=JSON.parse(raw);
  if(!Array.isArray(value)||value.length>50||value.some(item=>!item||typeof item.clientFileId!=="string"||!/^[0-9a-f-]{36}$/i.test(item.clientFileId)||typeof item.fieldId!=="string"||typeof item.name!=="string"||item.name.length>1000||!Number.isInteger(item.attempt)||item.attempt<1||item.attempt>2147483647||!Number.isInteger(item.byteSize)||item.byteSize<1||item.byteSize>25000000||!["image/jpeg","image/png","image/webp","image/heic","image/heif"].includes(item.mimeType)))throw new Error("form_tab_state_invalid");
  initial=value;
 }
 let persisted=raw;
 const transport:UploadTransport={
  reserve:body=>formRequest(path+"/uploads",{body,capability}),
  complete:id=>formRequest(path+"/uploads/"+id+"/complete",{body:{},capability}),
  async list(){return (await formRequest<components["schemas"]["FormsSession"]>(path,{capability})).uploads;},
  remove:id=>formRequest(path+"/uploads/"+id,{method:"DELETE",capability}),
  put(file,authorization,signal,onProgress){return new Promise((resolve,reject)=>{
   const xhr=new XMLHttpRequest();let done=false;
   const abort=()=>xhr.abort(),finish=(error?:Error)=>{if(done)return;done=true;signal.removeEventListener("abort",abort);if(error)reject(error);else resolve();};
   xhr.open("PUT",authorization.url);xhr.timeout=90000;xhr.setRequestHeader("Content-Type",file.type);for(const [name,value] of Object.entries(authorization.headers))xhr.setRequestHeader(name,value);
   xhr.upload.onprogress=event=>{if(event.lengthComputable)onProgress(Math.round(event.loaded/event.total*100));};
   xhr.onload=()=>finish(xhr.status>=200&&xhr.status<300?undefined:new Error("upload_transfer_unconfirmed"));xhr.onerror=()=>finish(new Error("upload_transfer_unconfirmed"));xhr.ontimeout=()=>finish(new Error("upload_transfer_unconfirmed"));xhr.onabort=()=>finish(new Error("upload_cancelled"));
   signal.addEventListener("abort",abort,{once:true});if(signal.aborted){finish(new Error("upload_cancelled"));return;}xhr.send(file);
  });}
 };
 return createFormUploadStore(transport,items=>{const serialized=JSON.stringify(items.map(({progress,...value})=>value));if(serialized!==persisted){sessionStorage.setItem(key,serialized);persisted=serialized;}},initial);
}
