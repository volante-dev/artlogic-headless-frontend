import {readFileSync} from "node:fs";
import type {APIRequestContext} from "@playwright/test";
export interface Fixture {published:{id:string;title:string|null;artist:string|null}[];hiddenId:string;hiddenTitle:string;hiddenMediaId:string;secrets:string[];sourceOrigin:string;identityOrigin:string;backendOrigin:string}
export function fixture():Fixture{const path=process.env.E2E_FIXTURE_PATH;if(!path)throw new Error("Use backend test:public:browser to provide an isolated fixture");return JSON.parse(readFileSync(path,"utf8"));}
export async function control(request:APIRequestContext,action:string,input:Record<string,string>={}){
  const response=await request.post(process.env.E2E_CONTROL_URL!+"/control",{headers:{"X-Test-Control":process.env.E2E_CONTROL_KEY!},data:{action,...input}});
  if(!response.ok())throw new Error("isolated_test_control_failed: "+response.status());return response.json();
}
