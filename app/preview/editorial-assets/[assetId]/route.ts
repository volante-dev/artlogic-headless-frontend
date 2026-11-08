import {editorialPreviewFetch} from "@/lib/editorial/preview-client";
import {previewFailure,previewHeaders} from "@/lib/presentation/preview-client";
import {PublicApiError} from "@/lib/api/client";
import {loadConfig} from "@/lib/config/env";
async function serve(request:Request,{params}:{params:Promise<{assetId:string}>}){try{
 const query=new URL(request.url).searchParams;if([...query.keys()].some(key=>!["snapshotId","variant"].includes(key))||query.getAll("snapshotId").length!==1||query.getAll("variant").length>1)throw new PublicApiError(400,"invalid_request");
 const value=await editorialPreviewFetch(query.get("snapshotId")!, (await params).assetId,query.get("variant")??undefined) as {url?:unknown;expiresAt?:unknown};if(typeof value.url!=="string"||value.url.length>8192||typeof value.expiresAt!=="string")throw new PublicApiError(503,"invalid_response");const url=new URL(value.url),ttl=Date.parse(value.expiresAt)-Date.now(),config=loadConfig();
 if(url.username||url.password||url.hash||!url.pathname.includes("/storage/v1/object/sign/")||!url.searchParams.has("token")||!(ttl>0&&ttl<=65000)||url.protocol!=="https:"&&!(config.DATA_MODE==="mock"&&url.protocol==="http:"&&["localhost","127.0.0.1","[::1]"].includes(url.hostname)))throw new PublicApiError(503,"invalid_response");
 return new Response(null,{status:307,headers:{...previewHeaders,Location:url.toString(),"Referrer-Policy":"no-referrer"}});
 }catch(error){return previewFailure(error,request.method==="HEAD");}}
export const GET=serve;export const HEAD=serve;
