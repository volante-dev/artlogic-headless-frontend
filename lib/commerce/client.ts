export class StoreRequestError extends Error {
 constructor(readonly status:number,readonly code:string,readonly issues:readonly {path:string;code:string}[]=[]){super(code);}
}
export async function storeRequest<T>(segments:readonly string[],input:{method?:'GET'|'POST';body?:unknown;key?:string;signal?:AbortSignal}={}):Promise<T>{
 const method=input.method??'POST',headers:Record<string,string>={Accept:'application/json'};if(input.body!==undefined)headers['Content-Type']='application/json';if(input.key)headers['Idempotency-Key']=input.key;
 let response:Response;
 try{response=await fetch('/api/store/'+segments.map(encodeURIComponent).join('/'),{method,headers,body:input.body===undefined?undefined:JSON.stringify(input.body),credentials:'same-origin',cache:'no-store',signal:input.signal??AbortSignal.timeout(45000)});}catch{throw new StoreRequestError(0,'uncertain_response');}
 const result=await response.json().catch(()=>null);if(!response.ok)throw new StoreRequestError(response.status,result?.error?.code??'provider_unavailable',Array.isArray(result?.error?.issues)?result.error.issues:[]);if(!result)throw new StoreRequestError(0,'uncertain_response');return result as T;
}
export function storeErrorMessage(error:unknown,locale:string){
 const fr=locale==='fr';if(error instanceof StoreRequestError){
  const messages:Record<string,[string,string]>={quote_changed:['Le prix ou les conditions ont changé. Vérifiez un nouveau récapitulatif.','Prices or terms changed. Review a new summary.'],terms_not_current:['Les conditions ont changé. Vérifiez la nouvelle version.','Terms changed. Review the new version.'],out_of_stock:['Un produit n’est plus disponible dans cette quantité. Votre panier est conservé.','A product is no longer available in this quantity. Your bag is preserved.'],attempt_in_progress:['Un paiement est déjà en cours de vérification. Consultez son état avant de recommencer.','A payment is already being checked. Check its status before starting again.'],quote_expired:['Ce récapitulatif a expiré. Vérifiez un nouveau récapitulatif.','This summary expired. Review a new summary.'],checkout_unavailable:['Les achats sont momentanément indisponibles. Votre panier est conservé.','Purchases are temporarily unavailable. Your bag is preserved.'],unauthorized:['Votre session a expiré. Rechargez cette page pour reprendre.','Your session expired. Reload this page to resume.'],uncertain_response:['La réponse n’a pas été reçue. Vérifiez l’état avant de recommencer.','No response was received. Check the status before trying again.']};
  if(messages[error.code])return messages[error.code]![fr?0:1];
 }
 return fr?'La demande n’a pas pu être confirmée. Votre saisie est conservée.':'The request could not be confirmed. Your input is preserved.';
}
