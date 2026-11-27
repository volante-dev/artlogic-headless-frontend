import {beforeEach,describe,it,expect,vi} from 'vitest';
vi.mock('server-only',()=>({}));
const state=vi.hoisted(()=>({content:vi.fn(),read:vi.fn(),routing:vi.fn(),locale:'it'}));
vi.mock('next/server',()=>({connection:async()=>{}}));
vi.mock('next/headers',()=>({headers:async()=>new Headers({'x-site-locale':state.locale})}));
vi.mock('../../lib/api/site-content',()=>({getSiteContent:state.content}));
vi.mock('../../lib/i18n/request-language',()=>({requestRoutingPolicy:state.routing,requestLanguagePolicy:state.read}));
vi.mock('../../lib/config/env',()=>({loadConfig:()=>({SITE_NAME:'Synthetic gallery',SITE_ORIGIN:'https://frontend.example.test',SITE_DESCRIPTION:'Description principale'}),configuredLocalePolicy:()=>({defaultLocale:'fr',locales:[{code:'fr',label:'Français'},{code:'en',label:'English'}]}),stringValue:(value:Record<string,string>,key:string)=>value[key],canonicalJson:(value:unknown)=>JSON.stringify(value)}));
import {loadSiteContent} from '../../lib/i18n/load-site-content';
import {initialMessages,legacyRuntimeMessages} from '../../lib/i18n/site-messages';
const policy={defaultLocale:'fr',locales:[{code:'fr',label:'Français'},{code:'it',label:'Italiano'}]},languagePolicy={...policy,publicRevision:'4'};
beforeEach(()=>{vi.clearAllMocks();state.locale='it';state.read.mockResolvedValue({kind:'runtime',policy:languagePolicy});state.routing.mockResolvedValue(policy);state.content.mockResolvedValue({revision:'3',locale:'it',policy:{...policy,fingerprint:'b'.repeat(64)},languagePolicy,messages:{...legacyRuntimeMessages(initialMessages('en'),'en'),'seo.section.home':'Galleria {siteName}'},logo:null,runtime:{catalogueId:'runtime-synthetic',publicRevision:'4',contentRevision:'3',modules:['core']}});});
describe('US3 runtime content is independent from the legacy configuration fingerprint',()=>{
 it('renders a contributed locale with its runtime policy without requiring an environment fingerprint',async()=>{const content=await loadSiteContent();expect(content.locale).toBe('it');expect(content.contentUnavailable).toBe(false);expect(content.description).toBe('Galleria Synthetic gallery');expect(content.policy.fingerprint).toBe('b'.repeat(64));});
 it.each([401,403,503])('preserves a runtime refusal %s without reviving initial environment content',async status=>{state.locale='fr';state.content.mockRejectedValue(Object.assign(new Error('language_content_unavailable'),{status,code:'language_content_unavailable'}));await expect(loadSiteContent()).rejects.toMatchObject({status,code:'language_content_unavailable'});});
 it('lets a revision refusal reach its one recovery boundary',async()=>{state.content.mockRejectedValue(Object.assign(new Error('language_policy_changed'),{status:409,code:'language_policy_changed'}));await expect(loadSiteContent()).rejects.toMatchObject({status:409,code:'language_policy_changed'});});
});
