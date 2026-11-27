import {beforeEach,it,expect,vi} from 'vitest';
vi.mock('server-only',()=>({}));
const state=vi.hoisted(()=>({fetch:vi.fn(),config:{ARTWORK_ADDRESSES_MINIMUM_CONTRACT_VERSION:'0'}}));
vi.mock('../../lib/config/env',async original=>({...await original<typeof import('../../lib/config/env')>(),loadConfig:()=>state.config}));
vi.mock('../../lib/api/client',async original=>({...await original<typeof import('../../lib/api/client')>(),publicFetch:state.fetch}));
import {getGalleryCatalog} from '../../lib/artworks/server';
import v0 from '../../../backend/tests/fixtures/artwork-addresses/v0.json';
beforeEach(()=>{state.fetch.mockReset();state.config.ARTWORK_ADDRESSES_MINIMUM_CONTRACT_VERSION='0';});
it('falls back only for an absent capability with floor zero',async()=>{
 state.fetch.mockImplementation(async(path:string)=>path.endsWith('/capabilities')?new Response(null,{status:404}):Response.json(v0.catalog));
 const result=await getGalleryCatalog();expect(result.items).toEqual(v0.catalog.items);expect(result).not.toHaveProperty('artworkAddresses');expect(state.fetch.mock.calls[1]![2]).toMatchObject({artworkAddresses:false});
 state.config.ARTWORK_ADDRESSES_MINIMUM_CONTRACT_VERSION='1';await expect(getGalleryCatalog()).rejects.toMatchObject({status:503});
});
it('never converts an outage, forbidden response or invalid capability into absence',async()=>{
 for(const response of [new Response(null,{status:503}),new Response(null,{status:403}),new Response('invalid',{status:200}),Response.json({schemaVersion:1,available:false,mode:'legacy',addressRevision:null,minimumContractVersion:1})]){state.fetch.mockReset();state.fetch.mockResolvedValue(response);await expect(getGalleryCatalog()).rejects.toMatchObject({status:503});expect(state.fetch).toHaveBeenCalledTimes(1);}
});
it('requires the negotiated envelope when a contract-capable API is available',async()=>{
 state.fetch.mockImplementation(async(path:string)=>path.endsWith('/capabilities')?Response.json({schemaVersion:1,available:true,mode:'active',addressRevision:'1',minimumContractVersion:1}):Response.json(v0.catalog));await expect(getGalleryCatalog()).rejects.toMatchObject({status:503,code:'invalid_response'});
});
