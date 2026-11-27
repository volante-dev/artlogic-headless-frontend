import {addressCapability} from '../artworks/server';
import {splitArtworkAddresses,attachArtworkAddresses} from '../artworks/addresses';
import {readLinkInBioCapability,readLinkInBioJson as json} from './capabilities';
import 'server-only';
import {cache} from 'react';
import {publicFetch,PublicApiError,responseLanguagePolicyChanged} from '../api/client';
import {decodeLinkInBio,readLinkInBioError,LinkInBioError} from './contracts';
function retryAfter(response:Response){const value=response.headers.get('Retry-After');return value&&/^\d{1,5}$/.test(value)?Math.min(Number(value),86400):undefined;}
export const loadLinkInBioCapabilities=cache(async()=>{
 try{const response=await publicFetch('/v1/public/link-in-bio/capabilities');if(await responseLanguagePolicyChanged(response))throw new PublicApiError(409,'language_policy_changed');
  return await readLinkInBioCapability(response);
 }catch(error){if(error instanceof PublicApiError)throw new LinkInBioError(error.status,error.code);throw error;}
});
export const loadPublicLinkInBio=cache(async(locale:string,cursor?:string,addresses=true)=>{
 try{const query=new URLSearchParams({locale});if(cursor)query.set('cursor',cursor);
  const negotiated=addresses&&await addressCapability(),response=await publicFetch('/v1/public/link-in-bio?'+query,undefined,{artworkAddresses:negotiated});if(await responseLanguagePolicyChanged(response))throw new PublicApiError(409,'language_policy_changed');const value=await json(response);
  if(!response.ok)throw readLinkInBioError(response.status,value,retryAfter(response));
  const parts=splitArtworkAddresses(value,negotiated),feed=attachArtworkAddresses(decodeLinkInBio('LibPublicFeed',parts.body),parts.addresses);
  if(feed.locale!==locale)throw new LinkInBioError(503,'dependency_unavailable');
  const headers=new Headers({'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});
  for(const name of ['Cache-Control','Age','Date','Retry-After']){const value=response.headers.get(name);if(value)headers.set(name,value);}
  // If an upstream omits its policy, do not manufacture cache permission.
  if(!headers.has('Cache-Control'))headers.set('Cache-Control','private, no-store');
  return {feed,headers};
 }catch(error){if(error instanceof PublicApiError)throw new LinkInBioError(error.status,error.code);throw error;}
});
