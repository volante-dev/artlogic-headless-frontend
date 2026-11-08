import {configuredLocalePolicy,loadConfig} from "@/lib/config/env";
import {privateHeaders,PublicApiError} from "@/lib/api/client";
import {parseEditorialQuery} from "@/lib/editorial/query";
import {getEditorialPage} from "@/lib/editorial/server";
import {editorialHttpError} from "@/lib/editorial/http-error";
import type {ArticleKind} from "@/lib/editorial/types";
export async function GET(request:Request){try{
 const query=new URL(request.url).searchParams,kind=query.get("kind"),locale=query.get("locale");if(query.getAll("kind").length!==1||query.getAll("locale").length!==1||!kind||!["publication","news","exhibition"].includes(kind)||!locale||!configuredLocalePolicy(loadConfig()).locales.some(item=>item.code===locale))throw new PublicApiError(400,"invalid_request");query.delete("kind");query.delete("locale");let criteria;try{criteria=parseEditorialQuery(query);}catch{throw new PublicApiError(400,"invalid_request");}return Response.json(await getEditorialPage(kind as ArticleKind,locale,criteria),{headers:privateHeaders});
 }catch(error){return editorialHttpError(error);}}
