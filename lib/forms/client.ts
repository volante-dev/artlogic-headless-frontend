"use client";
import type {components} from "./contract-types.generated";
export type FormDocument=components["schemas"]["FormsDocument"];
export class PublicFormError extends Error{constructor(readonly code:string,readonly issues:readonly components["schemas"]["FormsIssue"][]=[],readonly status=503){super(code);}}
export async function formRequest<T>(path:string,input?:{body?:unknown;method?:"GET"|"POST"|"DELETE";capability?:string;proof?:string;signal?:AbortSignal}):Promise<T>{
 const headers=new Headers({Accept:"application/json"});if(input?.capability)headers.set("X-Form-Capability",input.capability);if(input?.proof)headers.set("Idempotency-Key",input.proof);if(input?.body!==undefined)headers.set("Content-Type","application/json");
 try{const response=await fetch("/api/forms/"+path,{method:input?.method??(input?.body===undefined?"GET":"POST"),headers,body:input?.body===undefined?undefined:JSON.stringify(input.body),cache:"no-store",signal:input?.signal??AbortSignal.timeout(30_000)});if(response.status===204)return undefined as T;const data=await response.json();if(!response.ok)throw new PublicFormError(typeof data?.error?.code==="string"?data.error.code:"form_unavailable",Array.isArray(data?.error?.issues)?data.error.issues:[],response.status);return data as T;}catch(error){if(error instanceof PublicFormError)throw error;throw new PublicFormError("form_unavailable");}
}
