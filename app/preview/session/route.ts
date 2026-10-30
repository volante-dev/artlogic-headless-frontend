import {timingSafeEqual} from "node:crypto";
import {NextResponse,type NextRequest} from "next/server";
import {readPreviewStatus,closePreview,previewFailure,previewHeaders} from "@/lib/presentation/preview-client";
import {previewCookieSettings,clearPreviewCookies} from "@/lib/presentation/preview-cookies";
import {loadConfig,stringValue} from "@/lib/config/env";
import {PublicApiError} from "@/lib/api/client";
export async function GET(request:NextRequest){try{if(request.nextUrl.search)throw new PublicApiError(400,"invalid_request");return NextResponse.json(await readPreviewStatus(),{headers:previewHeaders});}catch(error){return previewFailure(error);}}
export async function DELETE(request:NextRequest){
 try{
  const stored=request.cookies.get(previewCookieSettings().names.csrf)?.value??"",csrf=request.headers.get("x-csrf-token")??"";
  if(request.headers.get("origin")!==stringValue(loadConfig(),"SITE_ORIGIN")||!/^[-A-Za-z0-9_]{43}$/.test(csrf)||stored.length!==csrf.length||!timingSafeEqual(Buffer.from(csrf),Buffer.from(stored)))throw new PublicApiError(403,"csrf_invalid");
  if(request.nextUrl.search)throw new PublicApiError(400,"invalid_request");
  const reader=request.body?.getReader();if(reader){const first=await reader.read();await reader.cancel();if(!first.done)throw new PublicApiError(400,"invalid_request");}
  await closePreview(csrf);const response=new NextResponse(null,{status:204,headers:previewHeaders});clearPreviewCookies(response);return response;
 }catch(error){return previewFailure(error);}
}
