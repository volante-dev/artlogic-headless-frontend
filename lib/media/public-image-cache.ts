/** Never let a cached redirect outlive its provider capability. Errors remain private. */
export function publicImageCacheHeaders(expiresAt:string,now=Date.now()){
 const ttl=Math.floor((Date.parse(expiresAt)-now)/1000),fresh=Math.min(86400,ttl-60);
 return fresh>0?{'Cache-Control':`public, max-age=${fresh}, s-maxage=${fresh}`}:{'Cache-Control':'private, no-store'};
}
