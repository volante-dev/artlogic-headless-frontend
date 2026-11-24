/** Older API routers bound a path parameter to 100 characters. The public slug
 * contract allows 113; transport its stable UUID through the existing endpoint. */
export function artworkApiReference(reference:string){
 if(reference.length<=100||!/^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$/i.test(reference))return reference;
 const id=reference.slice(-32);return `${id.slice(0,8)}-${id.slice(8,12)}-${id.slice(12,16)}-${id.slice(16,20)}-${id.slice(20)}`;
}
