import {NextResponse,type NextRequest} from 'next/server';
import {configuredLocalePolicy,loadConfig} from '@/lib/config/env';
import {storePublicRequest} from '@/lib/commerce/catalog';
import {PublicApiError} from '@/lib/api/client';
export async function GET(request:NextRequest,context:{params:Promise<{productId:string}>}){
 const {productId}=await context.params,query=request.nextUrl.searchParams,locale=query.get('locale'),policy=configuredLocalePolicy(loadConfig());
 const headers={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'};
 if(!/^[a-f0-9-]{36}$/i.test(productId)||[...query.keys()].some(k=>k!=='locale')||query.getAll('locale').length!==1||!policy.locales.some(l=>l.code===locale))return NextResponse.json({error:{code:'not_found'}},{status:404,headers});
 try{return NextResponse.json(await storePublicRequest('/v1/public/store/products/'+productId+'?'+new URLSearchParams({locale:locale!}),'CommerceProductPublic'),{headers});}
 catch(e){return NextResponse.json({error:{code:e instanceof PublicApiError&&e.status===404?'not_found':'provider_unavailable'}},{status:e instanceof PublicApiError&&e.status===404?404:503,headers});}
}
