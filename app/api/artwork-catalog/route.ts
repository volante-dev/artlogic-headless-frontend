import {configuredLocalePolicy,loadConfig} from "@/lib/config/env";
import {privateHeaders,PublicApiError} from "@/lib/api/client";
import {parseCatalogQuery,type CatalogParams} from "@/lib/artworks/catalog-query";
import {getGalleryCatalog} from "@/lib/artworks/server";

/** Public JSON only, using the same validation and fixed origin as the SSR catalogue. */
export async function GET(request:Request){
 try{
  const params=new URL(request.url).searchParams,policy=configuredLocalePolicy(loadConfig());
  if(params.getAll("locale").length!==1)throw new PublicApiError(400,"invalid_request");
  const locale=params.get("locale")!;params.delete("locale");
  if(!policy.locales.some(item=>item.code===locale))throw new PublicApiError(400,"invalid_request");
  const input:CatalogParams={};for(const key of params.keys())input[key]=params.getAll(key).length===1?params.get(key)!:params.getAll(key);
  let query;try{query=parseCatalogQuery(input);}catch{throw new PublicApiError(400,"invalid_request");}
  if(query.kind!=="numbered")throw new PublicApiError(400,"invalid_request");
  return Response.json(await getGalleryCatalog({...query.query,locale},true,request.signal),{headers:privateHeaders});
 }catch(error){
  const status=error instanceof PublicApiError&&[400,409,429].includes(error.status)?error.status:503;
  const code=status===400?"invalid_request":status===409?"catalog_changed":status===429?"rate_limited":"service_unavailable";
  return Response.json({error:{code,requestId:crypto.randomUUID()}},{status,headers:{...privateHeaders,...(status===429?{"Retry-After":String(error instanceof PublicApiError?error.retryAfterSeconds??60:60)}:{})}});
 }
}
