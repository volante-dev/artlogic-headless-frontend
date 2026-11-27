import 'server-only';
import {readRuntimeLanguagePolicy} from './runtime-policy';
/** A direct BFF admission has no page/proxy context. Historical sessions keep their own snapshot. */
export async function admissionLanguageHeaders():Promise<Record<string,string>>{
 const read=await readRuntimeLanguagePolicy();
 if(read.kind==='unavailable')throw new Error('language_policy_unavailable');
 return {'X-Site-Language-Contract':'1','X-Site-Language-Revision':read.policy.publicRevision};
}
