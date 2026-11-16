import type {components} from '../commerce/contract-types.generated';
type Policy=components['schemas']['CommerceConsentPolicy'];
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const string=(value:unknown,min:number,max:number):value is string=>typeof value==='string'&&value.length>=min&&value.length<=max;
/** Small public-policy boundary: ordinary editorial pages do not import the Commerce AJV registry. */
export function validConsentPolicy(value:unknown):value is Policy{
 if(!object(value)||Object.keys(value).some(k=>!['version','locale','categories','expiresInSeconds'].includes(k))||!string(value.version,1,100)||!string(value.locale,2,35)||!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(value.locale)||!Number.isInteger(value.expiresInSeconds)||Number(value.expiresInSeconds)<1||Number(value.expiresInSeconds)>15811200||!Array.isArray(value.categories)||value.categories.length>10)return false;
 const ids=new Set<string>();for(const c of value.categories){if(!object(c)||Object.keys(c).some(k=>!['id','label','description','required','providers'].includes(k))||!string(c.id,1,64)||ids.has(c.id)||!string(c.label,1,200)||!string(c.description,1,4000)||typeof c.required!=='boolean'||!Array.isArray(c.providers)||c.providers.length>20||c.providers.some(p=>!string(p,1,200)))return false;ids.add(c.id);}return true;
}
