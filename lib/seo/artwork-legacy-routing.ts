import redirects from './legacy-redirects.json';
/** Artwork history must be checked against attested identity before its generic section fallback. */
export function artworkHistoryFallback(path:string){const value=(redirects as Record<string,string>)[path];return value&&/^\/(?:[^/]+\/)?artworks(?:\/|$)/.test(value)?value:null;}
export const staticLegacyRedirects=Object.entries(redirects).filter(([,destination])=>!/^\/(?:[^/]+\/)?artworks(?:\/|$)/.test(destination)).map(([source,destination])=>({source,destination,statusCode:301 as const}));
