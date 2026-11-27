import {requestRoutingPolicy,withPublicLanguageRequest,isLanguagePolicyChanged} from '@/lib/i18n/request-language';
import {privateHeaders,PublicApiError} from "@/lib/api/client";
import {getEditorialFilters} from "@/lib/editorial/server";
import {editorialHttpError} from "@/lib/editorial/http-error";
import type {ArticleKind} from "@/lib/editorial/types";
export async function GET(request:Request){return withPublicLanguageRequest(()=>languageGet(request));}
async function languageGet(request:Request){try{
 const query=new URL(request.url).searchParams,kind=query.get("kind"),locale=query.get("locale");if(query.toString().length>4096||query.getAll("kind").length!==1||query.getAll("locale").length!==1||!kind||!["publication","news","exhibition"].includes(kind)||!locale||!(await requestRoutingPolicy()).locales.some(item=>item.code===locale))throw new PublicApiError(400,"invalid_request");query.delete("kind");query.delete("locale");return Response.json(await getEditorialFilters(kind as ArticleKind,locale,query),{headers:privateHeaders});
 }catch(error){if(isLanguagePolicyChanged(error))throw error;return editorialHttpError(error);}}
