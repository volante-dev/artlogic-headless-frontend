import {artworkAddressJsonResponse} from '@/lib/artworks/addresses';
import {requestRoutingPolicy,withPublicLanguageRequest,isLanguagePolicyChanged} from '@/lib/i18n/request-language';
import {privateHeaders,PublicApiError} from "@/lib/api/client";
import {parseEditorialQuery} from "@/lib/editorial/query";
import {getEditorialPage} from "@/lib/editorial/server";
import {editorialHttpError} from "@/lib/editorial/http-error";
import type {ArticleKind} from "@/lib/editorial/types";
export async function GET(request:Request){return withPublicLanguageRequest(()=>languageGet(request));}
async function languageGet(request:Request){try{
 const contract=request.headers.get("x-artwork-address-contract");if(contract!==null&&contract!=="1")throw new PublicApiError(400,"invalid_request");
 const query=new URL(request.url).searchParams,kind=query.get("kind"),locale=query.get("locale");if(query.getAll("kind").length!==1||query.getAll("locale").length!==1||!kind||!["publication","news","exhibition"].includes(kind)||!locale||!(await requestRoutingPolicy()).locales.some(item=>item.code===locale))throw new PublicApiError(400,"invalid_request");query.delete("kind");query.delete("locale");let criteria;try{criteria=parseEditorialQuery(query);}catch{throw new PublicApiError(400,"invalid_request");}return artworkAddressJsonResponse(await getEditorialPage(kind as ArticleKind,locale,criteria,request.headers.get("x-artwork-address-contract")==="1"),privateHeaders,request.headers.get("x-artwork-address-contract")==="1");
 }catch(error){if(isLanguagePolicyChanged(error))throw error;return editorialHttpError(error);}}
