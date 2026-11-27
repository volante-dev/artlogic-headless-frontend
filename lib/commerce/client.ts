import type {RuntimeMessageId} from '../i18n/site-messages';
export class StoreRequestError extends Error {
 constructor(readonly status:number,readonly code:string,readonly issues:readonly {path:string;code:string}[]=[]){super(code);}
}
export async function storeRequest<T>(segments:readonly string[],input:{method?:'GET'|'POST';body?:unknown;key?:string;signal?:AbortSignal}={}):Promise<T>{
 const method=input.method??'POST',headers:Record<string,string>={Accept:'application/json'};if(input.body!==undefined)headers['Content-Type']='application/json';if(input.key)headers['Idempotency-Key']=input.key;
 let response:Response;
 try{response=await fetch('/api/store/'+segments.map(encodeURIComponent).join('/'),{method,headers,body:input.body===undefined?undefined:JSON.stringify(input.body),credentials:'same-origin',cache:'no-store',signal:input.signal??AbortSignal.timeout(45000)});}catch{throw new StoreRequestError(0,'uncertain_response');}
 const result=await response.json().catch(()=>null);if(!response.ok)throw new StoreRequestError(response.status,result?.error?.code??'provider_unavailable',Array.isArray(result?.error?.issues)?result.error.issues:[]);if(!result)throw new StoreRequestError(0,'uncertain_response');return result as T;
}
export function storeErrorMessage(error:unknown,text:(id:RuntimeMessageId)=>string){
 const keys:Readonly<Record<string,RuntimeMessageId>>={"quote_changed": "store.error.quote_changed", "terms_not_current": "store.error.terms_not_current", "out_of_stock": "store.error.out_of_stock", "attempt_in_progress": "store.error.attempt_in_progress", "quote_expired": "store.error.quote_expired", "checkout_unavailable": "store.error.checkout_unavailable", "unauthorized": "store.error.unauthorized", "uncertain_response": "store.error.uncertain_response"};
 const key=error instanceof StoreRequestError&&Object.hasOwn(keys,error.code)?keys[error.code]:undefined;
 return text(key??'ui.eed4bf475334d230');
}
