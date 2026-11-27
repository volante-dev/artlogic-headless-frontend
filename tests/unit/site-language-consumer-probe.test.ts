import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
import {randomUUID} from 'node:crypto';
vi.mock('server-only',()=>({}));
const state=vi.hoisted(()=>({config:{} as Record<string,string>,read:vi.fn(),content:vi.fn(),scope:vi.fn((_read:unknown,work:()=>unknown)=>work())}));
vi.mock('../../lib/config/env',async original=>({...await original<typeof import('../../lib/config/env')>(),loadConfig:()=>state.config}));
vi.mock('../../lib/i18n/runtime-policy',()=>({readRuntimeLanguagePolicy:state.read}));
vi.mock('../../lib/i18n/request-language',()=>({withRuntimeLanguageRequest:state.scope}));
vi.mock('../../lib/api/site-content',()=>({getSiteContent:state.content}));
import {GET} from '../../app/api/internal/languages/ready/route';
const key='LOCAL_SYNTHETIC_PROBE_KEY_ONLY_FOR_038',slot=randomUUID(),site=randomUUID();
function request(extra=''){return new Request('https://frontend.example.test/api/internal/languages/ready?challengeId='+randomUUID()+extra,{headers:{'x-site-languages-probe-key':key,'x-site-languages-probe-expires-at':new Date(Date.now()+8000).toISOString()}});}
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv('RENDER','');vi.stubEnv('VERCEL_DEPLOYMENT_ID','');vi.stubEnv('E2E_LANGUAGES_DEPLOYMENT_ID','frontend-probe');state.config={SITE_ID:site,SITE_LANGUAGES_PROBE_KEY:key,SITE_LANGUAGES_CONSUMER_SLOT_ID:slot,SITE_LANGUAGES_RUNTIME_REQUIRED:'true',DATA_MODE:'mock',DEPLOYMENT_ENV:'test',FORMS_ENABLED:'true',COMMERCE_ENABLED:'true'};state.read.mockResolvedValue({kind:'runtime',policy:{defaultLocale:'fr',publicRevision:'1'}});state.content.mockResolvedValue({runtime:{publicRevision:'1',modules:['core','forms']}});});
afterEach(()=>vi.unstubAllEnvs());
describe('US3 frontend readiness observes its own runtime reader',()=>{
 it('uses the server slot and real runtime content, with no fabricated Store capability',async()=>{const response=await GET(request()),body=await response.json();expect(response.status).toBe(200);expect(body).toMatchObject({siteId:site,slotId:slot,deploymentId:'local:frontend-probe',runtimeRequired:true,observedPublicRevision:'1',modules:['core','forms']});expect(state.read).toHaveBeenCalledWith(true);expect(state.content).toHaveBeenCalledWith('fr',expect.any(AbortSignal));expect(response.headers.get('cache-control')).toBe('private, no-store');expect(response.headers.has('set-cookie')).toBe(false);expect(JSON.stringify(body)).not.toContain(key);});
 it('rejects a session or caller-owned slot before loading any policy',async()=>{const unsigned=new Request('https://frontend.example.test/api/internal/languages/ready?challengeId='+randomUUID(),{headers:{cookie:'session=synthetic'}});expect((await GET(unsigned)).status).toBe(401);expect((await GET(request('&slotId='+randomUUID()))).status).toBe(400);expect(state.read).not.toHaveBeenCalled();});
 it('never treats a legacy, absent or unbound runtime result as a compatible consumer',async()=>{state.read.mockResolvedValue({kind:'legacy'});expect((await GET(request())).status).toBe(503);state.read.mockResolvedValue({kind:'runtime',policy:{defaultLocale:'fr',publicRevision:'1'}});state.content.mockResolvedValue({runtime:{publicRevision:'2',modules:['core']}});expect((await GET(request())).status).toBe(503);state.content.mockResolvedValue({});expect((await GET(request())).status).toBe(503);});
});
