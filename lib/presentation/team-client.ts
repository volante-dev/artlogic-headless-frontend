import "server-only";
import {cache} from "react";
import {loadConfig,stringValue,numberValue} from "../config/env";
import {validateTeamCapabilities,validateTeamProjection} from "./validate-team-response";
import type {PublicPresentation} from "./types";
import type {TeamExtension} from "./team-types";
export class TeamReleaseChanged extends Error {}
export async function teamJson(path:string,headers:Record<string,string>={}){
 const config=loadConfig(),response=await fetch(stringValue(config,"BACKEND_URL").replace(/\/$/,"")+path,{headers:{Accept:"application/json",...headers},cache:"no-store",redirect:"error",signal:AbortSignal.timeout(Math.min(3000,numberValue(config,"PUBLIC_PAGE_REQUEST_TIMEOUT_MS")))});
 if(!response.ok){
  if(response.status===409&&path.startsWith("/v1/public/presentation/team?")){
   const reader=response.body?.getReader();let body="";
   if(reader)try{for(;;){const part=await reader.read();if(part.done)break;body+=Buffer.from(part.value).toString("utf8");if(body.length>4096)break;}}finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
   if(body.length<=4096){let code:unknown;try{code=JSON.parse(body)?.error?.code;}catch{/* Invalid errors degrade locally. */}if(code==="team_release_changed")throw new TeamReleaseChanged();}
  }else await response.body?.cancel();
  if(response.status===404&&path==="/v1/public/presentation/team/capabilities")return null;
  throw new Error("team_http_"+response.status);
 }
 if(response.headers.get("content-type")?.split(";")[0]!=="application/json"){await response.body?.cancel();throw new Error("team_invalid_content_type");}
 const reader=response.body?.getReader();if(!reader)throw new Error("team_empty_response");try{const chunks:Uint8Array[]=[];let bytes=0;for(;;){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>2097152)throw new Error("team_response_too_large");chunks.push(part.value);}return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;}finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
}
export const teamAvailable=cache(async()=>{if(loadConfig().PRESENTATION_TEAM_RENDER_ENABLED!=="true")return false;const result=await teamJson("/v1/public/presentation/team/capabilities");return result===null?false:validateTeamCapabilities(result).available;});
async function readTeam(p:PublicPresentation):Promise<TeamExtension>{const raw=await teamJson("/v1/public/presentation/team?"+new URLSearchParams({releaseId:p.releaseId,pageKey:p.pageKey,locale:p.locale}));return validateTeamProjection(raw,{scope:"public",id:p.releaseId,pageKey:p.pageKey,locale:p.locale});}
export async function withPublicTeam(presentation:PublicPresentation,reload:()=>Promise<PublicPresentation>):Promise<PublicPresentation>{
 try{if(!await teamAvailable())return presentation;return {...presentation,teamExtension:await readTeam(presentation)};}catch(error){
  if(error instanceof TeamReleaseChanged)try{const fresh=await reload();return {...fresh,teamExtension:await readTeam(fresh)};}catch{/* Local degradation after one coherent retry. */}
  console.warn("presentation_team_unavailable",{pageKey:presentation.pageKey,locale:presentation.locale});return {...presentation,teamExtension:null};
 }
}
