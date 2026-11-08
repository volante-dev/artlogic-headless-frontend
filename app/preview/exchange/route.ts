import {NextResponse,type NextRequest} from "next/server";
import {loadConfig,stringValue} from "@/lib/config/env";
import {PublicApiError} from "@/lib/api/client";
import {exchangePreview,previewFailure,previewHeaders} from "@/lib/presentation/preview-client";
import {putPreviewCookies} from "@/lib/presentation/preview-cookies";
export async function POST(request:NextRequest){try{
 const config=loadConfig();if(request.headers.get("origin")!==stringValue(config,"ADMIN_ORIGIN"))throw new PublicApiError(403,"csrf_invalid");
 if(request.nextUrl.search)throw new PublicApiError(400,"invalid_request");if(request.headers.get("content-type")?.split(";")[0]!=="application/x-www-form-urlencoded")throw new PublicApiError(415,"unsupported_media_type");
 const reader=request.body?.getReader();if(!reader)throw new PublicApiError(400,"invalid_request");const chunks:Uint8Array[]=[];let size=0;
 try{for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>4096)throw new PublicApiError(413,"payload_too_large");chunks.push(part.value);}}finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
 const form=new URLSearchParams(Buffer.concat(chunks).toString("utf8")),code=form.get("code"),embedded=form.get("embedded")==="1";if([...form.keys()].some(key=>key!=="code"&&key!=="embedded")||form.getAll("code").length!==1||form.getAll("embedded").length>1||form.has("embedded")&&!embedded||!code||!/^[A-Za-z0-9_-]{43}$/.test(code))throw new PublicApiError(400,"invalid_request");
 const exchanged=await exchangePreview(code),response=NextResponse.redirect(new URL(embedded&&exchanged.kind==="article"?"/preview/editorial/"+exchanged.snapshotId:"/preview",stringValue(config,"SITE_ORIGIN")),{status:303,headers:previewHeaders});
 putPreviewCookies(response,exchanged.previewSessionToken,exchanged.previewCsrfToken,exchanged.expiresAt,embedded);return response;
 }catch(error){return previewFailure(error);}}
