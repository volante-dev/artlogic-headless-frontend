import {decodeLinkInBio,readLinkInBioError,LinkInBioError,type Schemas} from './contracts';
export function linkInBioPublished(flag:boolean,capability:Schemas['LibPublicCapabilities']|null,locale:string){return flag&&!!capability?.enabled&&capability.published&&capability.routeClaimed&&capability.locales.includes(locale);}
export async function readLinkInBioJson(response:Response):Promise<unknown>{
 const reader=response.body?.getReader();if(!reader)throw new LinkInBioError(503,'dependency_unavailable');
 try{let bytes=0;const chunks:Uint8Array[]=[];for(;;){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.byteLength;if(bytes>524288)throw Error();chunks.push(chunk.value);}return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new LinkInBioError(503,'dependency_unavailable');}finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
}
export async function readLinkInBioCapability(response:Response){
 if(response.status===404){await response.body?.cancel();return null;}
 const value=await readLinkInBioJson(response);if(!response.ok)throw readLinkInBioError(response.status,value);try{return decodeLinkInBio('LibPublicCapabilities',value);}catch{throw new LinkInBioError(503,'dependency_unavailable');}
}
