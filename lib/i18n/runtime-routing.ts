import type {RoutingPolicy} from './routes';
import type {RuntimePolicyRead} from './runtime-policy-transport';
import {decodeLanguagePolicy,type PublicLanguagePolicy} from './language-policy-protocol';
export const languageContextHeader='x-site-language-context';
export type RoutingLanguageRead={kind:'ready';policy:RoutingPolicy;runtime:PublicLanguagePolicy;remainingMs:number}|{kind:'unavailable';reason:string};
/** SQL publication is the single source of routing locales. */
export function routingLanguagePolicy(read:RuntimePolicyRead):RoutingLanguageRead{
 if(read.kind==='unavailable')return read;
 return {kind:'ready',policy:{defaultLocale:read.policy.defaultLocale,locales:read.policy.locales.map(({code,label})=>({code,label}))},runtime:read.policy,remainingMs:read.remainingMs};
}
/** Internal request projection contains at most eight locales, never retired history. */
export function encodeLanguageRequest(policy:PublicLanguagePolicy,remainingMs:number,now=Date.now()):string{
 const {retiredCodes:_,...compact}=policy;void _;
 return Buffer.from(JSON.stringify({policy:compact,remainingMs,capturedAt:now}),'utf8').toString('base64url');
}
export function decodeLanguageRequest(input:string,siteId:string,now=Date.now()):{policy:PublicLanguagePolicy;remainingMs:number}{
 if(input.length>6000||!/^[A-Za-z0-9_-]+$/.test(input))throw new Error('invalid_language_context');
 const value=JSON.parse(Buffer.from(input,'base64url').toString('utf8')) as Record<string,unknown>;
 if(Object.keys(value).sort().join(',')!=='capturedAt,policy,remainingMs'||!Number.isSafeInteger(value.capturedAt)||typeof value.remainingMs!=='number'||value.remainingMs<=0||value.remainingMs>30000||!value.policy||typeof value.policy!=='object'||Array.isArray(value.policy)||Object.hasOwn(value.policy,'retiredCodes'))throw new Error('invalid_language_context');
 const elapsed=now-Number(value.capturedAt),remainingMs=value.remainingMs-elapsed;if(elapsed<0||remainingMs<=0)throw new Error('expired_language_context');
 return {policy:decodeLanguagePolicy({...value.policy,retiredCodes:[]},siteId),remainingMs};
}
