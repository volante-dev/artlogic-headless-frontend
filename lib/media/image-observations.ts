import{parseImageObservation,type ImageObservation}from'./image-observation.generated';
export {parseImageObservation as validateImageObservation};
export type {ImageObservation};
export function sendImageObservation(value:ImageObservation){if(typeof window==='undefined')return;try{const body=parseImageObservation(value);void fetch('/api/image-observations',{method:'POST',credentials:'same-origin',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).catch(()=>{});}catch{/* Diagnostics cannot break an image. */}}
