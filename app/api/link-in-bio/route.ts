import {configuredLocalePolicy,loadConfig} from '@/lib/config/env';
import {loadPublicLinkInBio} from '@/lib/link-in-bio/load-public';
import {LinkInBioError} from '@/lib/link-in-bio/contracts';
export async function GET(request:Request){
 try{
  const config=loadConfig();if(config.LINK_IN_BIO_ENABLED!=='true')throw new LinkInBioError(404,'not_found');
  const query=new URL(request.url).searchParams,locale=query.get('locale'),cursor=query.get('cursor');
  if([...query.keys()].some(key=>!['locale','cursor'].includes(key))||query.getAll('locale').length!==1||query.getAll('cursor').length>1||!locale||!configuredLocalePolicy(config).locales.some(l=>l.code===locale)||cursor!==null&&(!cursor||cursor.length>4096))throw new LinkInBioError(400,'validation_failed');
  const result=await loadPublicLinkInBio(locale,cursor??undefined);return Response.json(result.feed,{headers:result.headers});
 }catch(error){const e=error instanceof LinkInBioError?error:new LinkInBioError(503,'dependency_unavailable');return Response.json({error:{code:e.code,message:e.message,details:e.details,requestId:crypto.randomUUID()}},{status:e.status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',...(e.retryAfterSeconds?{'Retry-After':String(e.retryAfterSeconds)}:{})}});}
}
