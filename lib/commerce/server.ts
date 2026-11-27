import "server-only";
import {admissionLanguageHeaders} from '../i18n/admission-language';
import {commerceOperationAllowed} from "./admission";
import {visitorIp} from "../contact/network-context";
import {randomUUID} from "node:crypto";
import {NextResponse,type NextRequest} from "next/server";
import {loadConfig,stringValue,numberValue} from "../config/env";
import {acceptsPublicOrigin} from "../contact/public-origin";
import {publicCommerceOperation} from "./operations";
import {validCommerceContract} from "./contracts";
const privateHeaders={"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer","X-Content-Type-Options":"nosniff"};
const failure=(status:number,code:string)=>NextResponse.json({error:{code,requestId:randomUUID()}},{status,headers:privateHeaders});
async function bytes(stream:ReadableStream<Uint8Array>|null,limit:number){if(!stream)throw new Error('empty');const reader=stream.getReader(),chunks:Uint8Array[]=[];let size=0;try{for(;;){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>limit)throw new Error('limit');chunks.push(r.value);}return Buffer.concat(chunks);}finally{await reader.cancel().catch(()=>{});}}
export async function relayCommerce(request:NextRequest,segments:readonly string[]){
 const op=publicCommerceOperation(request.method,segments);if(!op)return failure(404,'not_found');
 const config=loadConfig();if(!acceptsPublicOrigin(request,config))return failure(403,'forbidden');
 if(request.nextUrl.search)return failure(400,'validation_failed');
 if(!config.COMMERCE_SERVICE_KEY)return failure(503,'checkout_unavailable');
 const headers=new Headers({Accept:'application/json','x-commerce-key':stringValue(config,'COMMERCE_SERVICE_KEY'),'x-commerce-origin':stringValue(config,'SITE_ORIGIN'),'x-request-id':randomUUID()});
 if((op.headers as readonly string[]).includes('x-commerce-visitor-ip')){try{headers.set('X-Commerce-Visitor-IP',visitorIp(request));}catch{return failure(403,'forbidden');}}
 const secure=new URL(stringValue(config,'SITE_ORIGIN')).protocol==='https:',withdrawal=op.id==='commerceSubmitWithdrawal',cookieName=(secure?'__Host-':'dev-')+(withdrawal?'store-withdrawal':'store-guest');
 if((op.headers as readonly string[]).includes('x-commerce-capability')){
  const capability=request.cookies.get(cookieName)?.value??'';if(!/^[A-Za-z0-9_-]{43}$/.test(capability))return failure(401,'unauthorized');headers.set('x-commerce-capability',capability);
 }
 if((op.headers as readonly string[]).includes('idempotency-key')){const key=request.headers.get('idempotency-key')??'';if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key))return failure(400,'validation_failed');headers.set('Idempotency-Key',key);}
 let body:unknown;
 if(op.bodySchema){
  if(request.headers.get('content-type')?.split(';')[0]?.trim()!=='application/json')return failure(400,'validation_failed');
  try{body=JSON.parse((await bytes(request.body,op.bodyLimit)).toString());if(!validCommerceContract(op.bodySchema,body))return failure(400,'validation_failed');}catch{return failure(400,'validation_failed');}
  headers.set('content-type','application/json');
  if(op.id==='commerceCreateGuestSession'){
   const purpose=(body as {purpose:string}).purpose,existing=request.cookies.get((secure?'__Host-':'dev-')+(purpose==='withdrawal'?'store-withdrawal':'store-guest'))?.value;
   if(existing&&/^[A-Za-z0-9_-]{43}$/.test(existing))headers.set('x-commerce-capability',existing);
  }
  if(op.id==='commerceReadOrderDocument'&&body&&typeof body==='object'&&'attemptId' in body){
   const capability=request.cookies.get((secure?'__Host-':'dev-')+'store-guest')?.value??'';
   if(!/^[A-Za-z0-9_-]{43}$/.test(capability))return failure(401,'unauthorized');headers.set('x-commerce-capability',capability);
  }
 }
 if(!commerceOperationAllowed(config.COMMERCE_ENABLED==='true',op.id,body))return failure(503,'checkout_unavailable');
 try{
  if(/^\/v1\/internal\/store\/(?:guest-sessions|cart\/validate|quotes|delivery-plan|delivery-quotes|consent-receipts)$/.test(op.resolvedPath))for(const [name,value]of Object.entries(await admissionLanguageHeaders()))headers.set(name,value);
  const response=await fetch(stringValue(config,'BACKEND_URL').replace(/\/$/,'')+op.resolvedPath,{method:op.method,headers,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(['commerceStartAttempt','commerceCancelAttempt'].includes(op.id)?Math.max(45000,numberValue(config,'REQUEST_TIMEOUT_MS')):numberValue(config,'REQUEST_TIMEOUT_MS'))});
  if(op.id==='commerceInternalDeliveryCapabilities'&&response.status===404)return failure(404,'not_found');
  if(!(op.statuses as readonly number[]).includes(response.status))throw new Error('status');
  if(op.id==='commerceReadOrderDocument'&&response.ok){if(response.headers.get('content-type')?.split(';')[0]!=='text/html')throw new Error('format');return new NextResponse(new Uint8Array(await bytes(response.body,5_000_000)).buffer,{headers:{...privateHeaders,'Content-Type':'text/html; charset=utf-8','Content-Disposition':'attachment; filename="document.html"'}});}
  if(response.headers.get('content-type')?.split(';')[0]!=='application/json')throw new Error('format');
  const result=JSON.parse((await bytes(response.body,1_000_000)).toString());
  if(response.status===409&&result?.error?.code==='language_policy_changed')return failure(409,'language_policy_changed');
  if(!response.ok&&!validCommerceContract('CommerceError',result))throw new Error('invalid_error');
  const responseSchema=(op.responseSchemas as Readonly<Record<string,string|null>>)[String(response.status)];
  if(response.ok&&responseSchema&&!validCommerceContract(responseSchema,result))throw new Error('invalid_response');
  if(op.id==='commerceCreateGuestSession'&&response.ok){
   if(!validCommerceContract('CommerceGuestSession',result))throw new Error('invalid_session');
   const {capability,...safe}=result,expiry=Math.floor((Date.parse(result.expiresAt)-Date.now())/1000);if(expiry<=0||expiry>605100)throw new Error('expiry');
   const out=NextResponse.json(safe,{status:response.status,headers:privateHeaders});
   out.cookies.set((secure?'__Host-':'dev-')+(result.purpose==='withdrawal'?'store-withdrawal':'store-guest'),capability,{httpOnly:true,secure,sameSite:'lax',path:'/',maxAge:Math.min(expiry,604800)});return out;
  }
  const out=NextResponse.json(result,{status:response.status,headers:privateHeaders}),retry=response.headers.get('retry-after');if(retry&&/^[1-9][0-9]{0,5}$/.test(retry))out.headers.set('Retry-After',retry);return out;
 }catch{return failure(503,'provider_unavailable');}
}
