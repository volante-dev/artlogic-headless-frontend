import type {ArtworkAddress} from './addresses';
export function artworkHref(art:{id:string;slug?:string;publicAddress?:ArtworkAddress},locale:string,defaultLocale:string){
 const a=art.publicAddress;if(a){if(a.artworkId!==art.id)throw new Error('artwork_address_identity_changed');if(a.locale===locale)return a.canonicalPath;const alternate=a.alternates.find(x=>x.locale===locale);if(!alternate)throw new Error('artwork_address_locale_unavailable');return alternate.path;}
 return (locale===defaultLocale?'':'/'+locale)+'/artworks/'+(art.slug??art.id);
}
