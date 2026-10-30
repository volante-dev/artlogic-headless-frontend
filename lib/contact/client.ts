"use client";
import type {ContactReceipt} from "./types";
export class ContactClientError extends Error{
 constructor(readonly code:string,readonly fields:readonly {field:string;reason:string}[]=[],readonly retryAfter?:number){super(code);}
}
export interface StoredContactProof{proof:string;expiresAt:number;reference?:string}
const key="artlogic:contact-receipt";
export function newContactProof():StoredContactProof{const bytes=crypto.getRandomValues(new Uint8Array(32));return {proof:btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/, ""),expiresAt:Date.now()+86400000};}
export function storeContactProof(value:StoredContactProof){try{sessionStorage.setItem(key,JSON.stringify(value));}catch{/* Storage is optional; current-page recovery remains available. */}}
export function clearContactProof(){try{sessionStorage.removeItem(key);}catch{/* No persistent form data is required. */}}
export function readContactProof():StoredContactProof|null{try{const value=JSON.parse(sessionStorage.getItem(key)??"null");if(!value||typeof value.proof!=="string"||!/^[A-Za-z0-9_-]{43}$/.test(value.proof)||typeof value.expiresAt!=="number"||value.expiresAt<=Date.now()){clearContactProof();return null;}return {proof:value.proof,expiresAt:value.expiresAt,...(typeof value.reference==="string"?{reference:value.reference}:{})};}catch{return null;}}
export async function contactRequest(path:"inquiries"|"receipt",body:unknown):Promise<ContactReceipt>{
 let response:Response;try{response=await fetch("/api/contact/"+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"});}catch{throw new ContactClientError("contact_unavailable");}
 let data;try{data=await response.json();}catch{throw new ContactClientError("contact_unavailable");}
 if(response.ok&&data?.accepted===true&&typeof data.reference==="string")return {accepted:true,reference:data.reference};
 const retry=response.headers.get("retry-after");throw new ContactClientError(typeof data?.error?.code==="string"?data.error.code:"contact_unavailable",Array.isArray(data?.error?.details)?data.error.details.slice(0,10):[],retry&&/^[1-9][0-9]{0,5}$/.test(retry)?Number(retry):undefined);
}

let contactDraft=false;
export function setContactDraft(dirty:boolean){contactDraft=dirty;}
export function hasContactDraft(){return contactDraft;}
