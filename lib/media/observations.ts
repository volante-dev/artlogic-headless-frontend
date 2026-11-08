export interface MediaObservation{resourceKind:"artwork"|"siteLogo";resourceId:string;displayId:string;retry:0|1;event:"loaded"|"failed"|"timeout"|"retry";elapsedMs:number}
export function sendMediaObservation(event:MediaObservation){
 if(typeof window==="undefined")return;
 void fetch("/api/media-observations",{method:"POST",credentials:"omit",keepalive:true,headers:{"Content-Type":"application/json"},body:JSON.stringify(event)}).catch(()=>{});
}
