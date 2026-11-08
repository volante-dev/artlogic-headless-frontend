import "server-only";
import {stringValue,listValue,type Config} from "../config/env";

/** Explicit website origins only: never derive trust from Host or forwarded headers. */
export function acceptsPublicOrigin(request:Request,config:Config):boolean{
 if(request.headers.get("sec-fetch-site")==="cross-site")return false;
 if(request.method==="GET"||request.method==="HEAD")return true;
 const origin=request.headers.get("origin");
 return origin!==null&&(origin===stringValue(config,"SITE_ORIGIN")||listValue(config,"SITE_ALLOWED_ORIGINS_JSON").includes(origin));
}
