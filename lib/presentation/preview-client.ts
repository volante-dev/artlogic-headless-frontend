import {validateNavigation} from "../navigation/validate";
import type {NavigationPreviewProjection} from "../navigation/types";
import {configuredLocalePolicy} from "../config/env";
import{previewFramePolicy}from"./preview-policy";
import "server-only";
import {NextResponse} from "next/server";
import {Ajv2020} from "ajv/dist/2020.js";
import addFormatsModule from "ajv-formats";
import {loadConfig,stringValue,numberValue} from "../config/env";
import {PublicApiError,privateHeaders} from "../api/client";
import {presentationSchemas} from "../../page-composer/schemas.generated";
import type {components} from "../api/generated";
import {validatePreviewPresentation} from "./validate-response";
import type {PageKey} from "./types";
import {previewHandle} from "./preview-cookies";
import {parseGalleryPreviewExperience} from "../artworks/validate";
export const previewHeaders={...privateHeaders,"X-Robots-Tag":"noindex, nofollow, noarchive",get "Content-Security-Policy"(){return previewFramePolicy();}};
export type PreviewStatus=components["schemas"]["PresentationPreviewStatus"];
export type PreviewExchange=components["schemas"]["PresentationPreviewExchange"];
const ajv=new Ajv2020({strict:true,coerceTypes:false,removeAdditional:false});(addFormatsModule as unknown as (a:Ajv2020)=>void)(ajv);ajv.addKeyword({keyword:"example",valid:true});
const validateExchange=ajv.compile(presentationSchemas.PresentationPreviewExchange),validateStatus=ajv.compile(presentationSchemas.PresentationPreviewStatus);
export function previewFailure(error:unknown,head=false){const status=error instanceof PublicApiError&&[400,401,403,404,413,415,429].includes(error.status)?error.status:503;return new NextResponse(head?null:JSON.stringify({error:{code:status===401?"preview_unauthorized":status===403?"csrf_invalid":status===404?"not_found":"preview_unavailable"}}),{status,headers:{...previewHeaders,"Content-Type":"application/json"}});}
const paths={titles:"/v1/internal/preview/artwork-titles",navigation:"/v1/preview/navigation",exchange:"/v1/internal/preview/exchange",session:"/v1/preview/session",close:"/v1/preview/session",presentation:"/v1/preview/presentation",artwork:"/v1/internal/preview/artwork-experience"} as const;
async function call(operation:keyof typeof paths,input:{handle?:string;code?:string;csrf?:string;query?:URLSearchParams}={}){
 const config=loadConfig(),method=operation==="exchange"?"POST":operation==="close"?"DELETE":"GET";
 const headers=new Headers({Accept:"application/json","X-Preview-Key":stringValue(config,"PREVIEW_SERVICE_KEY")});if(input.handle)headers.set("X-Preview-Session",input.handle);if(input.csrf)headers.set("X-CSRF-Token",input.csrf);if(input.code)headers.set("Content-Type","application/json");
 let response:Response;try{response=await fetch(stringValue(config,"BACKEND_URL").replace(/\/$/,"")+paths[operation]+(input.query?"?"+input.query:""),{method,headers,body:input.code?JSON.stringify({code:input.code}):undefined,cache:"no-store",redirect:"error",signal:AbortSignal.timeout(numberValue(config,"REQUEST_TIMEOUT_MS"))});}catch{throw new PublicApiError(503,"preview_unavailable");}
 if(!response.ok){await response.body?.cancel();throw new PublicApiError([400,401,403,404,429].includes(response.status)?response.status:503,"preview_unavailable");}
 if(response.status===204)return null;
 if(response.headers.get("content-type")?.split(";")[0]!=="application/json"){await response.body?.cancel();throw new PublicApiError(503,"invalid_response");}
 const reader=response.body?.getReader();if(!reader)throw new PublicApiError(503,"invalid_response");
 try{const chunks:Uint8Array[]=[];let size=0;for(;;){const p=await reader.read();if(p.done)break;size+=p.value.byteLength;if(size>(operation==="presentation"||operation==="artwork"||operation==="titles"?10485760:operation==="navigation"?8192:4096))throw new Error();chunks.push(p.value);}return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;}catch{throw new PublicApiError(503,"invalid_response");}finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
}
export async function exchangePreview(code:string):Promise<PreviewExchange>{const data=await call("exchange",{code});if(!validateExchange(data))throw new PublicApiError(503,"invalid_response");return data as PreviewExchange;}
export async function readPreviewStatus():Promise<PreviewStatus>{const data=await call("session",{handle:await previewHandle()});if(!validateStatus(data))throw new PublicApiError(503,"invalid_response");return data as PreviewStatus;}
export async function closePreview(csrf:string){await call("close",{handle:await previewHandle(),csrf});}
export async function readPreviewArtwork(){const data=await call("artwork",{handle:await previewHandle()});try{return parseGalleryPreviewExperience(data);}catch{throw new PublicApiError(503,"invalid_response");}}
export async function readPreviewPresentation(pageKey:PageKey,locale:string){
 const data=await call("presentation",{handle:await previewHandle(),query:new URLSearchParams({pageKey,locale})});return validatePreviewPresentation(data,{profileId:stringValue(loadConfig(),"SITE_PROFILE"),pageKey,locale});
}

export async function readPreviewNavigation(locale:string,snapshotId:string):Promise<NavigationPreviewProjection>{const value=await call("navigation",{handle:await previewHandle(),query:new URLSearchParams({locale,expectedSnapshotId:snapshotId})});return validateNavigation(value,{scope:"preview",locale,id:snapshotId,policy:configuredLocalePolicy(loadConfig())}) as NavigationPreviewProjection;}

export async function readPreviewArtworkTitles(ids:readonly string[],locale:string){
 if(!ids.length)return [];const data=await call("titles",{handle:await previewHandle(),query:new URLSearchParams({ids:ids.join(","),locale})}) as {items?:{id:string;title:string|null}[]};
 if(!data||!Array.isArray(data.items)||data.items.length>100||data.items.some(a=>!ids.includes(a.id)||!(a.title===null||typeof a.title==="string")))throw new PublicApiError(503,"invalid_response");return data.items;
}
