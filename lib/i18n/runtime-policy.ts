import 'server-only';
import {loadConfig,stringValue} from '../config/env';
import {RuntimePolicyTransport} from './runtime-policy-transport';
let reader:RuntimePolicyTransport|undefined;
/** Process-local freshness lasts at most five seconds and never extends the origin's lease. */
export async function readRuntimeLanguagePolicy(force=false){
 if(!reader){const config=loadConfig();reader=new RuntimePolicyTransport({siteId:stringValue(config,'SITE_ID'),cacheOrigin:typeof config.SITE_LANGUAGES_POLICY_CACHE_ORIGIN==='string'?config.SITE_LANGUAGES_POLICY_CACHE_ORIGIN:stringValue(config,'SITE_ORIGIN'),backendOrigin:stringValue(config,'BACKEND_URL'),allowLoopbackHttp:config.DATA_MODE==='mock'&&config.DEPLOYMENT_ENV==='test',fetch:(...args)=>fetch(...args)});}
 return reader.read(force);
}
