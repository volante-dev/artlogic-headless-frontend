import {publicFetch,PublicApiError,privateHeaders,uuidPattern} from "@/lib/api/client";
export async function GET(_request:Request,{params}:{params:Promise<{logoId:string}>}){try{
  const {logoId}=await params;if(!uuidPattern.test(logoId))throw new PublicApiError(404,"not_found");
  const response=await publicFetch("/v1/public/site-logos/"+logoId);
  if(!response.ok){await response.body?.cancel();throw new PublicApiError([400,404,429].includes(response.status)?response.status:503,response.status===404?"not_found":"service_unavailable");}
  if(!response.body||response.headers.get("content-type")?.split(";")[0]!=="image/webp"){await response.body?.cancel();throw new PublicApiError(503,"invalid_response");}
  const headers=new Headers({...privateHeaders,"Content-Type":"image/webp"}),length=response.headers.get("content-length");if(length&&/^\d+$/.test(length))headers.set("Content-Length",length);
  return new Response(response.body,{status:200,headers});
}catch(error){const status=error instanceof PublicApiError?error.status:503;return Response.json({error:{code:status===404?"not_found":"service_unavailable"}},{status,headers:privateHeaders});}}
