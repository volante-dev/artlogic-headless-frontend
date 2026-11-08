import {afterEach,expect,it,vi} from 'vitest';
vi.mock('server-only',()=>({}));
vi.mock('../../lib/config/env',()=>({loadConfig:()=>({BACKEND_URL:'https://private-api.test',PUBLIC_PAGE_REQUEST_TIMEOUT_MS:45000}),stringValue:(c:Record<string,string>,key:string)=>c[key],numberValue:(c:Record<string,number>,key:string)=>c[key]}));
import {publicFetch} from '../../lib/api/client';
afterEach(()=>vi.restoreAllMocks());
it('correlates API header timing without logging the URL, query or content',async()=>{
 const info=vi.spyOn(console,'info').mockImplementation(()=>{}),fetch=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({private:'body'},{headers:{'x-api-instance-id':'instance-1','x-api-initialization-id':'initialization-1'}}));
 await publicFetch('/v1/public/artworks?q=private-title');const event=JSON.parse(String(info.mock.calls[0]![0]));expect(event).toMatchObject({event:'public_api_fetch',category:'artworks',result:'headers',apiInstanceId:'instance-1',apiInitializationId:'initialization-1'});expect(event.durationMs).toBeGreaterThanOrEqual(0);expect(fetch.mock.calls[0]![1]).toMatchObject({cache:'no-store',headers:{'X-API-Read-Id':event.readId}});expect(JSON.stringify(info.mock.calls)).not.toMatch(/private-title|private-api|body/);
});
it('reports failed transfers without serializing network exceptions',async()=>{
 const info=vi.spyOn(console,'info').mockImplementation(()=>{});vi.spyOn(globalThis,'fetch').mockRejectedValue(Error('private credentials in https://username:password@host'));await expect(publicFetch('/v1/public/site-content')).rejects.toMatchObject({status:503});expect(JSON.parse(String(info.mock.calls[0]![0]))).toMatchObject({result:'network_error'});expect(JSON.stringify(info.mock.calls)).not.toMatch(/password|username|credentials/);
});
