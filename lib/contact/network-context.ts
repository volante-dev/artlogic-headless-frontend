import "server-only";
import {isIP} from "node:net";
import {createHash,timingSafeEqual} from "node:crypto";
import {loadConfig,stringValue,isLoopback} from "../config/env";
export function visitorIp(request:Request):string{
 const c=loadConfig();
 if(c.DATA_MODE==="mock"&&c.DEPLOYMENT_ENV!=="production"&&isLoopback(new URL(request.url).hostname)){
  const synthetic=request.headers.get("x-contact-mock-visitor")??"127.0.0.1";
  if(!/^127\./.test(synthetic)||!isIP(synthetic))throw new Error("contact_provenance_refused");return synthetic;
 }
 // Vercel overwrites x-vercel-forwarded-for at its managed ingress. Trust it
 // only in that server-controlled runtime, never from a browser marker/header.
 // https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for
 if(process.env.VERCEL==="1"){
  const ip=request.headers.get("x-vercel-forwarded-for")??"";
  if(!isIP(ip))throw new Error("contact_provenance_refused");return ip;
 }
 const actual=request.headers.get("x-contact-ingress-key")??"",expected=stringValue(c,"CONTACT_INGRESS_KEY");
 if(!actual||!timingSafeEqual(createHash("sha256").update(actual).digest(),createHash("sha256").update(expected).digest()))throw new Error("contact_provenance_refused");
 const ip=request.headers.get(stringValue(c,"CONTACT_TRUSTED_INGRESS_HEADER"))??"";if(!isIP(ip))throw new Error("contact_provenance_refused");return ip;
}
