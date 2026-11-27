import {decodeProtectedHeader} from 'jose';
import {Ajv2020} from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {loadConfig,stringValue} from '@/lib/config/env';
import {artworkAddressSchemas} from '@/lib/artworks/artwork-address-schemas.generated';
import {openArtworkProbeRequest,sealArtworkProbeResponse} from '@/lib/artworks/artwork-address-probe-protocol.server.generated';
import type {ArtworkProbeRequest,ArtworkProbeKey,ArtworkAddressConsumer} from '@/lib/artworks/artwork-address-consumers.generated';
import {parseArtworkAddressSet} from '@/lib/artworks/addresses';
import {parseGalleryExperience} from '@/lib/artworks/validate';
import {artworkHref} from '@/lib/artworks/artwork-href';
import {artworkApiReference} from '@/lib/artworks/artwork-api-reference';
import {classifyRoute} from '@/lib/i18n/routes';
const ajv=new Ajv2020({strict:true,strictTypes:false,coerceTypes:false,removeAdditional:false});(addFormats as unknown as (a:Ajv2020)=>void)(ajv);const validate=ajv.compile(artworkAddressSchemas.ProbeRequest);
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
class ProbeError extends Error{constructor(readonly code:string){super(code);}}
async function json(body:ReadableStream<Uint8Array>|null){const reader=body?.getReader();if(!reader)throw new ProbeError('invalid_request');try{let size=0;const parts:Uint8Array[]=[];for(;;){const p=await reader.read();if(p.done)break;size+=p.value.length;if(size>65536)throw new ProbeError('invalid_request');parts.push(p.value);}return JSON.parse(Buffer.concat(parts).toString('utf8')) as unknown;}finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}}
export async function POST(request:Request){
 try{
  if(request.headers.get('x-artwork-address-probe-contract')!=='1'||new URL(request.url).search)throw new ProbeError('invalid_request');
  const authorization=request.headers.get('authorization');if(!authorization?.startsWith('Bearer ')||authorization.length>8200)throw new ProbeError('unauthorized');
  const value=await json(request.body);if(!validate(value))throw new ProbeError('invalid_request');const body=value as ArtworkProbeRequest,config=loadConfig(),siteId=stringValue(config,'SITE_ID');
  const keys=JSON.parse(String(config.ARTWORK_ADDRESS_PROBE_KEYS_JSON??'[]')) as ArtworkProbeKey[],consumers=JSON.parse(String(config.ARTWORK_ADDRESS_CONSUMERS_JSON??'[]')) as ArtworkAddressConsumer[];
  if(!Array.isArray(keys)||!Array.isArray(consumers))throw new ProbeError('service_unavailable');const consumer=consumers.find(c=>c.consumerId===body.consumerId&&c.role==='frontend');if(!consumer||consumer.origin!==new URL(request.url).origin||body.siteId!==siteId)throw new ProbeError('forbidden');
  const token=authorization.slice(7);await openArtworkProbeRequest(token,body,keys,{siteId,consumerId:consumer.consumerId,audience:consumer.origin+'/api/artwork-address-probe',now:Math.floor(Date.now()/1000)});
  const key=keys.find(k=>k.siteId===siteId&&k.consumerId===consumer.consumerId&&k.kid===decodeProtectedHeader(token).kid)!;
  const observed=process.env.VERCEL_DEPLOYMENT_ID??(config.DATA_MODE==='mock'&&config.DEPLOYMENT_ENV==='test'?String(config.ARTWORK_ADDRESS_BUILD_ID):null);if(!observed)throw new ProbeError('service_unavailable');
  const set=parseArtworkAddressSet({schemaVersion:1,mode:'active',addressRevision:'0',contextRevision:body.contextRevision,items:[body.fixture.address]}),address=set.items[0]!,all=[{locale:address.locale,path:address.canonicalPath},...address.alternates],defaultLocale=all.find(a=>a.path.startsWith('/artworks/'))?.locale;if(!defaultLocale)throw new ProbeError('invalid_request');
  const policy={defaultLocale,locales:[...new Set(all.map(a=>a.locale))].map(code=>({code,label:code}))},route=classifyRoute(address.canonicalPath,policy),art={id:body.fixture.artworkId,slug:body.fixture.legacySlug,publicAddress:address},signal=AbortSignal.any([request.signal,AbortSignal.timeout(5000)]);
  const hidden=await fetch(new URL(address.canonicalPath,consumer.origin),{cache:'no-store',redirect:'manual',signal});await hidden.body?.cancel();
  const v0=await fetch(new URL('/api/artwork-experiences/'+art.id+'?'+new URLSearchParams({locale:address.locale}),consumer.origin),{cache:'no-store',redirect:'error',signal});if(!v0.ok){await v0.body?.cancel();throw new ProbeError('service_unavailable');}const legacy=parseGalleryExperience(await json(v0.body));
  const legacyResponse=await fetch(new URL('/api/artwork-experiences/'+artworkApiReference(art.slug)+'?'+new URLSearchParams({locale:address.locale}),consumer.origin),{cache:'no-store',redirect:'error',signal});if(!legacyResponse.ok){await legacyResponse.body?.cancel();throw new ProbeError('service_unavailable');}const legacyResolved=parseGalleryExperience(await json(legacyResponse.body)).artwork.id===art.id;
  const results={uuidResolved:classifyRoute((address.locale===defaultLocale?'':'/'+address.locale)+'/artworks/'+art.id,policy).artworkId===art.id,legacyResolved,preparedResolved:route.kind==='artwork'&&route.artworkId===address.slug&&artworkHref(art,address.locale,defaultLocale)===address.canonicalPath,localeRespected:route.locale===address.locale&&address.alternates.every(a=>classifyRoute(a.path,policy).locale===a.locale&&artworkHref(art,a.locale,defaultLocale)===a.path),v0Compatible:legacy.artwork.id===art.id&&legacy.artwork.slug===art.slug,publicPreparedHidden:hidden.status===404&&!hidden.headers.has('Location')};
  return Response.json({schemaVersion:1,attestation:await sealArtworkProbeResponse(body,key,observed,results,Math.floor(Date.now()/1000))},{headers});
 }catch(error){const raw=error&&typeof error==='object'&&'code'in error?String(error.code):'service_unavailable',code=['invalid_request','unauthorized','forbidden','not_found','preparation_stale','address_context_changed'].includes(raw)?raw:'service_unavailable',status=code==='invalid_request'?400:code==='unauthorized'?401:code==='forbidden'?403:code==='not_found'?404:code==='preparation_stale'||code==='address_context_changed'?409:503;return Response.json({error:{code,requestId:crypto.randomUUID()}},{status,headers});}
}
