const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export interface PublicFormOperation{method:"GET"|"POST"|"DELETE";path:string;bodySchema?:string;emptyBody?:boolean;responseSchema:string;capability?:boolean;proof?:boolean;query?:readonly string[]}
/** A browser cannot choose an arbitrary backend route, method, header or query parameter. */
export function publicFormOperation(method:string,segments:readonly string[]):PublicFormOperation|null{
 if(method==="GET"&&segments.length===1&&uuid.test(segments[0]!))return {method,path:"/"+segments[0],responseSchema:"FormsPublic",query:["locale","ownerType","ownerId","blockId","artworkId"]};
 if(method==="POST"&&segments.length===2&&uuid.test(segments[0]!)&&segments[1]==="sessions")return {method,path:"/"+segments.join("/"),bodySchema:"FormsSessionInput",responseSchema:"FormsSessionCreated"};
 if(method==="GET"&&segments.length===2&&segments[0]==="sessions"&&uuid.test(segments[1]!))return {method,path:"/"+segments.join("/"),responseSchema:"FormsSession",capability:true};
 if(method==="POST"&&segments.length===3&&segments[0]==="sessions"&&uuid.test(segments[1]!)&&segments[2]==="submit")return {method,path:"/"+segments.join("/"),bodySchema:"FormsSubmissionInput",responseSchema:"FormsReceipt",capability:true,proof:true};
 if(method==="POST"&&segments.length===2&&segments[0]==="receipts"&&segments[1]==="recover")return {method,path:"/receipts/recover",bodySchema:"FormsReceiptRecoveryInput",responseSchema:"FormsReceipt",proof:true};
 if(segments[0]==="sessions"&&uuid.test(segments[1]??"")&&segments[2]==="uploads"){
  if(method==="POST"&&segments.length===3)return {method,path:"/"+segments.join("/"),bodySchema:"FormsUploadInput",responseSchema:"FormsUpload",capability:true};
  if(uuid.test(segments[3]??"")){
   if(method==="DELETE"&&segments.length===4)return {method,path:"/"+segments.join("/"),responseSchema:"",capability:true};
   if(method==="POST"&&segments.length===5&&["complete","preview"].includes(segments[4]!))return {method,path:"/"+segments.join("/"),emptyBody:true,responseSchema:segments[4]==="preview"?"FormsAccess":"FormsUpload",capability:true};
  }
 }
 return null;
}
