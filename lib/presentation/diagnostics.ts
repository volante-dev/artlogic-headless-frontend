/** Strict projections only: no URLs, response bodies, stack traces or credentials. */
export function diagnosticId(value:unknown):string|undefined{return typeof value==='string'&&/^[a-zA-Z0-9_:.-]{1,160}$/.test(value)?value:undefined;}
const failureNames=new Set(['TimeoutError','AbortError','TypeError','SyntaxError']);
const failureCodes=new Set(['ECONNRESET','ECONNREFUSED','ETIMEDOUT','ENOTFOUND','EAI_AGAIN','UND_ERR_CONNECT_TIMEOUT','UND_ERR_HEADERS_TIMEOUT','UND_ERR_BODY_TIMEOUT','UND_ERR_SOCKET']);
export function failureKind(error:unknown){
 const e=error as {name?:string;cause?:{code?:string}}|null;
 return {errorType:failureNames.has(e?.name??'')?e!.name:'Error',...(failureCodes.has(e?.cause?.code??'')?{networkCode:e!.cause!.code}:{})};
}
export type PresentationReadEvent={readId:string;operation:'presentation'|'page-address';phase:'start'|'complete'|'fetch'|'http'|'body'|'json'|'validation';durationMs:number;timeoutMs:number;pageKey?:string;locale:string;renderId?:string;status?:number;apiRequestId?:string;apiEdgeId?:string;apiInstanceId?:string;apiInitializationId?:string;headersMs?:number;bodyMs?:number;jsonMs?:number;validationMs?:number;bytes?:number;errorType?:string;networkCode?:string};
export function presentationReadLog(event:PresentationReadEvent){
 const data={event:'public_presentation_read',...event,durationMs:Math.max(0,Math.round(event.durationMs))};
 if(['start','complete'].includes(event.phase))console.info(JSON.stringify(data));else console.error(JSON.stringify(data));
}
