export interface PublicMediaGrant{resourceId:string;version:string;url:string;expiresAt:string;mimeType:"image/webp";byteSize:number}
const keys=["resourceId","version","url","expiresAt","mimeType","byteSize"];
export function validatePublicMediaGrant(value:unknown,id:string,origins:readonly string[],now=Date.now()):PublicMediaGrant{
 if(!value||typeof value!=="object"||Array.isArray(value))throw Error("invalid_response");const g=value as PublicMediaGrant;
 if(Object.keys(g).length!==keys.length||!keys.every(k=>Object.hasOwn(g,k))||g.resourceId!==id||g.version!==id||g.mimeType!=="image/webp"||!Number.isSafeInteger(g.byteSize)||g.byteSize<1||typeof g.url!=="string"||g.url.length>8192||typeof g.expiresAt!=="string")throw Error("invalid_response");
 const url=new URL(g.url),q=url.searchParams;
 if(!origins.includes(url.origin)||url.username||url.password||url.hash||!/^\/storage\/v1\/object\/sign\/[^/]+\/.+/.test(url.pathname)||!["https:","http:"].includes(url.protocol))throw Error("invalid_response");
 if([...q.keys()].some(k=>k!=="token")||q.getAll("token").length!==1)throw Error("invalid_response");
 const token=q.get("token")??"";if(!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))throw Error("invalid_response");
 // The capability comes from our API and an allowlisted storage origin. Reading
 // these claims validates its binding/lifetime; it does not verify a JWT signature.
 let claims:{url?:unknown;exp?:unknown};try{claims=JSON.parse(Buffer.from(token.split(".")[1]!,"base64url").toString("utf8"));}catch{throw Error("invalid_response");}
 const expiry=Date.parse(g.expiresAt),path=decodeURIComponent(url.pathname.slice("/storage/v1/object/sign/".length));
 if(claims.url!==path||typeof claims.exp!=="number"||!Number.isSafeInteger(claims.exp)||!Number.isFinite(expiry)||expiry<=now||expiry-now>604800000||expiry>claims.exp*1000||claims.exp*1000-now>604830000)throw Error("invalid_response");
 return g;
}
export function parseDisplayQuery(url:URL){
 if([...url.searchParams.keys()].some(k=>!["retry","displayId"].includes(k))||[...url.searchParams.keys()].some(k=>url.searchParams.getAll(k).length!==1))throw Error("invalid_request");
 const retry=url.searchParams.get("retry"),displayId=url.searchParams.get("displayId");
 if(retry!==null&&!/^[01]$/.test(retry)||displayId!==null&&!/^[A-Za-z0-9_.:-]{1,160}$/.test(displayId))throw Error("invalid_request");
 return {retry:retry==="1"?1:0,displayId};
}
