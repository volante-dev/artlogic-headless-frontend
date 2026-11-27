import {createHash} from 'node:crypto';
import {loadConfig,stringValue,canonicalJson} from '@/lib/config/env';
import {authenticateConsumerProbe,ConsumerProbeError,resolveLanguageDeployment,languageConsumerModules} from '@/lib/i18n/consumer-probe-protocol.generated';
import {runtimeSupportedCatalogueIds} from '@/lib/i18n/message-definitions.generated';
import {messageRegistry} from '@/lib/i18n/messages.generated';
import {readRuntimeLanguagePolicy} from '@/lib/i18n/runtime-policy';
import {withRuntimeLanguageRequest} from '@/lib/i18n/request-language';
import {getSiteContent} from '@/lib/api/site-content';
const privateHeaders={'Cache-Control':'private, no-store','Vercel-CDN-Cache-Control':'no-store'};
/** No admin session. A readiness challenge reads this deployment's actual runtime content path. */
export async function GET(request:Request){
 try{
  const config=loadConfig(),query=new URL(request.url).searchParams;
  const challenge=authenticateConsumerProbe({key:request.headers.get('x-site-languages-probe-key'),challengeId:query.get('challengeId'),expiresAt:request.headers.get('x-site-languages-probe-expires-at')},typeof config.SITE_LANGUAGES_PROBE_KEY==='string'?config.SITE_LANGUAGES_PROBE_KEY:undefined,Date.now());
  if([...query.keys()].some(key=>key!=='challengeId')||query.getAll('challengeId').length!==1)throw new ConsumerProbeError('validation_failed',400);
  const slotId=config.SITE_LANGUAGES_CONSUMER_SLOT_ID;if(config.SITE_LANGUAGES_RUNTIME_REQUIRED!=='true'||typeof slotId!=='string')throw new ConsumerProbeError('consumer_unavailable',503);
  const read=await readRuntimeLanguagePolicy(true);if(read.kind!=='runtime')throw new ConsumerProbeError('consumer_unavailable',503);
  const remaining=Date.parse(challenge.expiresAt)-Date.now();if(remaining<=0)throw new ConsumerProbeError('consumer_unavailable',503);
  const signal=AbortSignal.any([request.signal,AbortSignal.timeout(remaining)]);
  const content=await withRuntimeLanguageRequest(read,()=>getSiteContent(read.policy.defaultLocale,signal));
  if(!content.runtime||content.runtime.publicRevision!==read.policy.publicRevision||Date.parse(challenge.expiresAt)<=Date.now())throw new ConsumerProbeError('consumer_unavailable',503);
  const modules=languageConsumerModules('frontend',config).filter(module=>content.runtime!.modules.includes(module));if(!modules.includes('core'))throw new ConsumerProbeError('consumer_unavailable',503);
  const receipt={siteId:stringValue(config,'SITE_ID'),slotId,deploymentId:resolveLanguageDeployment({...process.env,DATA_MODE:String(config.DATA_MODE),DEPLOYMENT_ENV:String(config.DEPLOYMENT_ENV)}),challengeId:challenge.id,contractVersion:1,runtimeRequired:true,observedPublicRevision:content.runtime.publicRevision,catalogueIds:[...runtimeSupportedCatalogueIds,'legacy-002-'+createHash('sha256').update(canonicalJson(messageRegistry)).digest('hex')],descriptorVersion:'1',modules,observedAt:new Date().toISOString()};
  return Response.json(receipt,{headers:privateHeaders});
 }catch(error){const safe=error instanceof ConsumerProbeError?error:new ConsumerProbeError('consumer_unavailable',503);return Response.json({error:{code:safe.code}},{status:safe.status,headers:privateHeaders});}
}
