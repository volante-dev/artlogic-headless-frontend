// Generated from feature039 contracts. Do not edit; independent of legacy fingerprints.
import {createHash} from 'node:crypto';
import {SignJWT,jwtVerify,decodeProtectedHeader} from 'jose';
import type {ArtworkProbeRequest,ArtworkProbeKey,ArtworkProbeResults,ArtworkProbeAttestation} from './artwork-address-consumers.generated';
import {artworkProbeChecks} from './artwork-address-consumers.generated';
import {canonicalAddressJson} from './artwork-address-canonical-json.generated';
class DomainError extends Error {constructor(readonly code:string){super(code);}}
const digest=(v:unknown)=>createHash('sha256').update(canonicalAddressJson(v)).digest('hex');
function secret(key:ArtworkProbeKey){if(!/^[A-Za-z0-9_-]+$/.test(key.key))throw new DomainError('service_unavailable');const bytes=Buffer.from(key.key,'base64url');if(bytes.length<32||bytes.toString('base64url')!==key.key)throw new DomainError('service_unavailable');return bytes;}
function window(body:ArtworkProbeRequest,now:number){if(body.expiresAt!==body.issuedAt+60||body.issuedAt>now+5||now>=body.expiresAt||!Number.isSafeInteger(body.issuedAt)||!Number.isSafeInteger(body.expiresAt)||!/^[A-Za-z0-9_-]{43}$/.test(body.nonce)||Buffer.from(body.nonce,'base64url').length!==32)throw new DomainError('unauthorized');}
function bindings(body:ArtworkProbeRequest){return {jti:body.challengeId,nonce:body.nonce,siteId:body.siteId,operationId:body.operationId,consumerId:body.consumerId,requestDigest:digest(body)};}
async function seal(payload:Record<string,unknown>,key:ArtworkProbeKey){return new SignJWT(payload).setProtectedHeader({alg:'HS256',typ:'JWT',kid:key.kid}).sign(secret(key));}
async function open(token:string,keys:readonly ArtworkProbeKey[],options:{siteId:string;consumerId:string;audience:string;issuer:string;now:number;max:number}){
 if(typeof token!=='string'||token.length>options.max)throw new DomainError('unauthorized');
 try{
  const h=decodeProtectedHeader(token);if(h.alg!=='HS256'||h.typ!=='JWT'||Object.keys(h).sort().join(',')!=='alg,kid,typ')throw new Error();
  const key=keys.find(k=>k.kid===h.kid&&k.siteId===options.siteId&&k.consumerId===options.consumerId);if(!key)throw new Error();
  const result=await jwtVerify(token,secret(key),{algorithms:['HS256'],typ:'JWT',audience:options.audience,issuer:options.issuer,currentDate:new Date(options.now*1000),clockTolerance:0,requiredClaims:['iat','exp','jti','scope','nonce','siteId','operationId','consumerId','requestDigest']});return result.payload;
 }catch{throw new DomainError('unauthorized');}
}
export async function sealArtworkProbeRequest(body:ArtworkProbeRequest,key:ArtworkProbeKey,audience:string){return seal({...bindings(body),iss:'artwork-address-coordinator',aud:audience,scope:'artwork-address-probe:request',iat:body.issuedAt,exp:body.expiresAt},key);}
export async function openArtworkProbeRequest(token:string,body:ArtworkProbeRequest,keys:readonly ArtworkProbeKey[],options:{siteId:string;consumerId:string;audience:string;now:number}){
 window(body,options.now);if(body.siteId!==options.siteId||body.consumerId!==options.consumerId)throw new DomainError('forbidden');
 const claims=await open(token,keys,{...options,issuer:'artwork-address-coordinator',max:8192}),expected={...bindings(body),iss:'artwork-address-coordinator',aud:options.audience,scope:'artwork-address-probe:request',iat:body.issuedAt,exp:body.expiresAt};
 if(canonicalAddressJson(claims)!==canonicalAddressJson(expected))throw new DomainError('unauthorized');return claims;
}
export async function sealArtworkProbeResponse(body:ArtworkProbeRequest,key:ArtworkProbeKey,observedBuildId:string,results:ArtworkProbeResults,now:number){return seal({...bindings(body),iss:body.consumerId,aud:'artwork-address-coordinator',scope:'artwork-address-probe:response',reportDigest:body.reportDigest,consumerInventoryRevision:body.consumerInventoryRevision,contextRevision:body.contextRevision,observedBuildId,checkedAt:now,iat:now,exp:body.expiresAt,...results},key);}
export async function openArtworkProbeResponse(token:string,body:ArtworkProbeRequest,key:ArtworkProbeKey,now:number):Promise<ArtworkProbeAttestation>{
 window(body,now);const claims=await open(token,[key],{siteId:body.siteId,consumerId:body.consumerId,audience:'artwork-address-coordinator',issuer:body.consumerId,now,max:32768});
 const expected={...bindings(body),iss:body.consumerId,aud:'artwork-address-coordinator',scope:'artwork-address-probe:response',reportDigest:body.reportDigest,consumerInventoryRevision:body.consumerInventoryRevision,contextRevision:body.contextRevision,observedBuildId:body.expectedBuildId,exp:body.expiresAt,iat:claims.iat,checkedAt:claims.checkedAt,...Object.fromEntries(artworkProbeChecks.map(k=>[k,true]))};
 if(canonicalAddressJson(claims)!==canonicalAddressJson(expected)||typeof claims.iat!=='number'||claims.iat<body.issuedAt||claims.iat>=body.expiresAt||claims.iat>now+5||claims.checkedAt!==claims.iat)throw new DomainError('activation_blocked');return claims as unknown as ArtworkProbeAttestation;
}
