import {readFileSync} from "node:fs";
import type {APIRequestContext} from "@playwright/test";
export function plpSites(){return JSON.parse(readFileSync(process.env.E2E_GALLERY_FIXTURE!,"utf8")).sites as {controlUrl:string;controlKey:string;siteOrigin:string;profile:string}[];}
export async function setPlp(request:APIRequestContext,enabled:boolean,pattern="mixed",site=plpSites()[0]!){const r=await request.post(site.controlUrl,{headers:{"X-Test-Control":site.controlKey},data:{action:"plp",enabled,pattern}});if(!r.ok())throw new Error("fixture_configuration_failed");}
