import {it,expect,vi,afterEach} from 'vitest';
import {randomUUID,randomBytes} from 'node:crypto';
vi.mock('server-only',()=>({}));
const state=vi.hoisted(()=>({config:{} as Record<string,string>}));
vi.mock('../../lib/config/env',async original=>({...await original<typeof import('../../lib/config/env')>(),loadConfig:()=>state.config}));
import {POST} from '../../app/api/artwork-address-probe/route';
import {sealArtworkProbeRequest,openArtworkProbeResponse} from '../../lib/artworks/artwork-address-probe-protocol.server.generated';
import type {ArtworkProbeRequest} from '../../lib/artworks/artwork-address-consumers.generated';
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
it('evaluates the shipped path/parser helpers and signs its observed deployment, with no allocation',async()=>{
 const siteId=randomUUID(),id=randomUUID(),consumerId='frontend.fixture',origin='https://fixture.example',buildId='fixture.frontend.1',key={siteId,consumerId,kid:'fixture.1',key:randomBytes(32).toString('base64url')},now=Math.floor(Date.now()/1000),legacy='objet-'+id.replaceAll('-','');
 vi.stubEnv('VERCEL_DEPLOYMENT_ID',buildId);state.config={SITE_ID:siteId,ARTWORK_ADDRESS_PROBE_KEYS_JSON:JSON.stringify([key]),ARTWORK_ADDRESS_CONSUMERS_JSON:JSON.stringify([{consumerId,role:'frontend',origin,buildId,deploymentId:buildId,projectId:'fixture',rollback:true}])};
 const body:ArtworkProbeRequest={schemaVersion:1,challengeId:randomUUID(),nonce:randomBytes(32).toString('base64url'),siteId,operationId:randomUUID(),consumerId,expectedBuildId:buildId,consumerInventoryRevision:'inventory.1',reportDigest:'a'.repeat(64),contextRevision:'context.1',issuedAt:now,expiresAt:now+60,fixture:{artworkId:id,legacySlug:legacy,address:{artworkId:id,locale:'fr',slug:'objet',canonicalPath:'/artworks/objet',alternates:[{locale:'en',slug:'object',path:'/en/artworks/object'}]}}};
 const calls:string[]=[];vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL)=>{const path=new URL(String(input)).pathname;calls.push(path);return path==='/artworks/objet'?new Response(null,{status:404}):Response.json({scope:'public',artwork:{id,slug:legacy,title:'Objet',artist:null,year:null,medium:null,dimensions:null,media:[]},locale:'fr',description:null,descriptionLocale:null,presentationReleaseId:null,catalogRevision:1});}));
 const url=origin+'/api/artwork-address-probe',token=await sealArtworkProbeRequest(body,key,url),request=()=>new Request(url,{method:'POST',headers:{'Content-Type':'application/json','X-Artwork-Address-Probe-Contract':'1',Authorization:'Bearer '+token},body:JSON.stringify(body)});
 const response=await POST(request());expect(response.status).toBe(200);const value=await response.json(),proof=await openArtworkProbeResponse(value.attestation,body,key,Math.floor(Date.now()/1000));expect(proof.observedBuildId).toBe(buildId);expect(calls).toEqual(['/artworks/objet','/api/artwork-experiences/'+id,'/api/artwork-experiences/'+legacy]);expect(JSON.stringify(value)).not.toContain(key.key);
 const invalid=await POST(new Request(url,{method:'POST',headers:{'X-Artwork-Address-Probe-Contract':'1',Authorization:'Bearer '+token},body:JSON.stringify({...body,nonce:randomBytes(32).toString('base64url')})}));expect(invalid.status).toBe(401);expect(calls).toHaveLength(3);
});
