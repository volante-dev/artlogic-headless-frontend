import 'server-only';
import {publicJson,PublicApiError} from '../api/client';
import type {PublicLanguagePolicy} from './language-policy-protocol';
/** The backend resolves native identity and current visibility; this boundary rejects unsafe responses too. */
export async function resolveRetiredPath(path:string,policy:Pick<PublicLanguagePolicy,'publicRevision'|'defaultLocale'|'locales'|'retiredCodes'>){
 const query=new URLSearchParams({path,revision:policy.publicRevision}),value=await publicJson('/v1/public/languages/redirects/resolve?'+query);
 if(!value||typeof value!=='object'||Array.isArray(value))throw new PublicApiError(503,'invalid_response');
 const body=value as Record<string,unknown>,target=body.targetPath;
 if(Object.keys(body).sort().join(',')!=='publicRevision,targetKind,targetPath'||body.publicRevision!==policy.publicRevision||!['equivalent','section','home'].includes(String(body.targetKind))||typeof target!=='string'||target.length>2048||!target.startsWith('/')||target.startsWith('//')||(target.includes('#')||target.includes('\\')||Array.from(target).some(char=>char.charCodeAt(0)<=32||char.charCodeAt(0)===127)))throw new PublicApiError(503,'invalid_response');
 const url=new URL(target,'https://retired.invalid');for(const part of url.pathname.split('/')){let decoded:string;try{decoded=decodeURIComponent(part);}catch{throw new PublicApiError(503,'invalid_response');}if(decoded==='.'||decoded==='..'||Array.from(decoded).some(char=>'/?#\\'.includes(char)||char.charCodeAt(0)<=32||char.charCodeAt(0)===127))throw new PublicApiError(503,'invalid_response');}
 const first=url.pathname.split('/')[1];if(url.pathname!==target.split('?')[0]||policy.retiredCodes.includes(first??'')||policy.locales.some(locale=>locale.code===first))throw new PublicApiError(503,'invalid_response');
 return target;
}
