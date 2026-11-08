import {beforeEach,afterEach,it,expect,vi} from 'vitest';
vi.mock('server-only',()=>({}));
vi.mock('../../lib/config/env',()=>({loadConfig:()=>({BACKEND_URL:'https://api.test',PUBLIC_PAGE_REQUEST_TIMEOUT_MS:45000,SITE_PROFILE:'default'}),stringValue:(c:Record<string,string>,k:string)=>c[k],numberValue:(c:Record<string,number>,k:string)=>c[k]}));
vi.mock('../../lib/presentation/validate-response',()=>({validatePublicPresentation:(value:unknown)=>{if(!(value as {valid?:boolean}).valid)throw Error('private body and credentials');return value;},validatePresentationAddress:(v:unknown)=>v}));
import {getPublicPresentation} from '../../lib/presentation/client';
let info:ReturnType<typeof vi.spyOn>,error:ReturnType<typeof vi.spyOn>;
beforeEach(()=>{info=vi.spyOn(console,'info').mockImplementation(()=>{});error=vi.spyOn(console,'error').mockImplementation(()=>{});});
afterEach(()=>vi.restoreAllMocks());
it('correlates a fresh read with the server-owned API identifier and preserves freshness',async()=>{
 const fetch=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({valid:true},{headers:{'x-request-id':'11111111-1111-4111-8111-111111111111','x-api-instance-id':'instance-test','x-api-initialization-id':'initialization-test'}}));
 await getPublicPresentation('home','fr',undefined,'dub1::test-render');
 const start=JSON.parse(String(info.mock.calls[0]![0])),end=JSON.parse(String(info.mock.calls[1]![0]));expect(start.phase).toBe('start');expect(end).toMatchObject({phase:'complete',readId:start.readId,renderId:'dub1::test-render',apiRequestId:'11111111-1111-4111-8111-111111111111',apiInstanceId:'instance-test',apiInitializationId:'initialization-test'});
 for(const field of ['headersMs','bodyMs','jsonMs','validationMs'])expect(end[field]).toBeGreaterThanOrEqual(0);
 expect(fetch.mock.calls[0]![1]).toMatchObject({cache:'no-store',redirect:'error',headers:{'X-Presentation-Read-Id':start.readId}});
});
it('distinguishes timeout, HTTP refusal, malformed JSON and invalid schema without logging payloads',async()=>{
 const fetch=vi.spyOn(globalThis,'fetch');
 const cases=[{phase:'fetch',apply:()=>fetch.mockRejectedValueOnce(new DOMException('https://private:credential@host','TimeoutError'))},{phase:'http',apply:()=>fetch.mockResolvedValueOnce(new Response('secret upstream',{status:503}))},{phase:'json',apply:()=>fetch.mockResolvedValueOnce(new Response('secret malformed'))},{phase:'validation',apply:()=>fetch.mockResolvedValueOnce(Response.json({password:'secret-password'}))}];
 for(const c of cases){c.apply();await expect(getPublicPresentation('home','fr')).rejects.toMatchObject({status:503});expect(JSON.parse(String(error.mock.calls.at(-1)![0])).phase).toBe(c.phase);}
 expect(JSON.stringify([...info.mock.calls,...error.mock.calls])).not.toMatch(/credential|secret|password|api\.test|private body/);
});
