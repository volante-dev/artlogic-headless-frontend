import {faviconResponse} from '@/lib/site-favicon/response';
import {loadConfig,stringValue,listValue} from '@/lib/config/env';
export async function GET(request:Request){const config=loadConfig();return faviconResponse(request,{backendUrl:stringValue(config,'BACKEND_URL'),allowedOrigins:listValue(config,'PUBLIC_MEDIA_DELIVERY_ORIGINS_JSON'),mock:config.DATA_MODE==='mock',fetch,signal:request.signal,warn:event=>console.warn(JSON.stringify(event))});}
export async function HEAD(request:Request){const response=await GET(request);return new Response(null,{status:response.status,headers:response.headers});}
