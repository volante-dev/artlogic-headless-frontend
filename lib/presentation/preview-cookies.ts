import "server-only";
import {cookies} from "next/headers";
import type {NextResponse} from "next/server";
import {loadConfig,stringValue,isLoopback} from "../config/env";
import {PublicApiError} from "../api/client";
export function previewCookieSettings(){
 const c=loadConfig(),origin=new URL(stringValue(c,"SITE_ORIGIN")),secure=origin.protocol==="https:";
 if(!secure&&!(c.DATA_MODE==="mock"&&["local","test"].includes(String(c.DEPLOYMENT_ENV))&&isLoopback(origin.hostname)))throw new Error("secure_preview_cookies_required");
 const prefix=secure?"__Host-":"",site=stringValue(c,"SITE_ID");
 return {secure,names:{session:prefix+"artlogic_preview_"+site,csrf:prefix+"artlogic_preview_csrf_"+site}};
}
export async function previewHandle(){const value=(await cookies()).get(previewCookieSettings().names.session)?.value;if(!value||!/^[A-Za-z0-9_-]{43}$/.test(value))throw new PublicApiError(401,"preview_unauthorized");return value;}
export function putPreviewCookies(response:NextResponse,session:string,csrf:string,expiresAt:string){
 const {secure,names}=previewCookieSettings();for(const [kind,value] of [["session",session],["csrf",csrf]] as const)response.cookies.set(names[kind],value,{secure,httpOnly:kind==="session",sameSite:"lax",path:"/",expires:new Date(expiresAt)});
}
export function clearPreviewCookies(response:NextResponse){const {secure,names}=previewCookieSettings();for(const kind of ["session","csrf"] as const)response.cookies.set(names[kind],"",{secure,httpOnly:kind==="session",sameSite:"lax",path:"/",maxAge:0});}
