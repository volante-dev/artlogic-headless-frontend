import type {RuntimePolicyRead} from '../../lib/i18n/runtime-policy-transport';
/** Current mandatory SQL-policy envelope for route tests unrelated to language admission. */
export function managedLanguageRead():RuntimePolicyRead{
 const now=Date.now();
 return {kind:'runtime',remainingMs:29000,policy:{contractVersion:1,siteId:'38000000-0000-4000-8000-000000000001',mode:'managed',publicRevision:'1',defaultLocale:'fr',locales:[{code:'fr',intlLocale:'fr',label:'Français',direction:'ltr'},{code:'en',intlLocale:'en',label:'English',direction:'ltr'}],retiredCodes:[],catalogueId:'synthetic-current',issuedAt:new Date(now).toISOString(),validUntil:new Date(now+30000).toISOString()}};
}
