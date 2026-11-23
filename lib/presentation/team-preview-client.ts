import "server-only";
import {stringValue,loadConfig} from "../config/env";
import {previewHandle} from "./preview-cookies";
import {teamAvailable,teamJson} from "./team-client";
import {validateTeamProjection} from "./validate-team-response";
import type {PageKey} from "./types";
export async function readTeamPreview(snapshotId:string,pageKey:PageKey,locale:string){
 try{if(!await teamAvailable())return null;const raw=await teamJson("/v1/preview/presentation/team?"+new URLSearchParams({pageKey,locale}),{"X-Preview-Key":stringValue(loadConfig(),"PREVIEW_SERVICE_KEY"),"X-Preview-Session":await previewHandle()});return validateTeamProjection(raw,{scope:"preview",id:snapshotId,pageKey,locale});}catch{console.warn("presentation_team_preview_unavailable",{pageKey,locale});return null;}
}
