import {splitArtworkAddresses,attachArtworkAddresses} from '../artworks/addresses';
import {decodeLinkInBio,readLinkInBioError,LinkInBioError} from './contracts';
export async function readLinkInBioPage(locale:string,cursor:string|null,signal:AbortSignal){
 const query=new URLSearchParams({locale});if(cursor)query.set('cursor',cursor);
 const response=await fetch('/api/link-in-bio?'+query,{signal:AbortSignal.any([signal,AbortSignal.timeout(45000)]),credentials:'omit',redirect:'error',cache:'no-store',headers:{Accept:'application/json','X-Artwork-Address-Contract':'1'}});
 const text=await response.text();if(text.length>524288)throw new LinkInBioError(503,'dependency_unavailable');
 let value:unknown;try{value=JSON.parse(text);}catch{throw new LinkInBioError(503,'dependency_unavailable');}
 if(!response.ok)throw readLinkInBioError(response.status,value);
 const p=splitArtworkAddresses(value),page=attachArtworkAddresses(decodeLinkInBio('LibPublicFeed',p.body),p.addresses);if(page.locale!==locale)throw new LinkInBioError(503,'dependency_unavailable');return page;
}
