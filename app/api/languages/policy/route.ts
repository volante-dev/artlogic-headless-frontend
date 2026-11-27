import {loadConfig,stringValue} from '../../../../lib/config/env';
import {languagePolicyCacheResponse} from '../../../../lib/i18n/policy-cache-response';
export async function GET(request:Request){
 if(new URL(request.url).search)return Response.json({error:{code:'invalid_request'}},{status:400,headers:{'Cache-Control':'private, no-store','Vercel-CDN-Cache-Control':'no-store'}});
 const config=loadConfig();
 return languagePolicyCacheResponse({backendUrl:stringValue(config,'BACKEND_URL'),siteId:stringValue(config,'SITE_ID'),fetch:(...args)=>fetch(...args)});
}
