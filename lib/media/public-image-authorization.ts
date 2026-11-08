import type{components}from'../api/generated';
import{canonicalImageCandidate}from'./public-image-policy.generated';
import type{ImageResource}from'./public-image-url';
type Grant=components['schemas']['PublicImageAuthorization'];
const exact=(v:unknown,keys:string[])=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==keys.length||!keys.every(k=>Object.hasOwn(v,k)))throw Error('invalid_image_response');return v as Record<string,unknown>;};
const positive=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>0;
export function validateImageGrant(value:unknown,resource:ImageResource,version:string,rendition:string,origins:readonly string[],now=Date.now()):Grant{
 const g=exact(value,['resourceKind','resourceId','sourceVersion','policyVersion','requestedRendition','canonicalRendition','source','representation','delivery']);
 if(g.resourceKind!==resource.resourceKind||g.resourceId!==resource.resourceId.toLowerCase()||g.sourceVersion!==version||g.policyVersion!=='r1'||g.requestedRendition!==rendition)throw Error('invalid_image_response');
 const s=exact(g.source,['width','height','mimeType','byteSize']);if(!positive(s.width)||!positive(s.height)||!positive(s.byteSize)||!['image/webp','image/jpeg','image/png','image/gif','image/svg+xml'].includes(String(s.mimeType)))throw Error('invalid_image_response');
 const c=canonicalImageCandidate(s as Grant['source'],rendition),p=exact(g.representation,['mode','expectedWidth','expectedHeight','mimeType','byteSize']);
 if(g.canonicalRendition!==c.rendition||p.mode!==c.mode||p.expectedWidth!==c.expectedWidth||p.expectedHeight!==c.expectedHeight||p.mimeType!==(c.mode==='transformed'?null:s.mimeType)||p.byteSize!==(c.mode==='transformed'?null:s.byteSize))throw Error('invalid_image_response');
 const d=exact(g.delivery,['url','expiresAt']);if(typeof d.url!=='string'||d.url.length>8192||typeof d.expiresAt!=='string')throw Error('invalid_image_response');
 const u=new URL(d.url),prefix='/storage/v1/'+(c.mode==='transformed'?'render/image':'object')+'/sign/';if(!origins.includes(u.origin)||u.username||u.password||u.hash||!u.pathname.startsWith(prefix)||![...u.searchParams.keys()].every(k=>k==='token')||u.searchParams.getAll('token').length!==1||!['https:','http:'].includes(u.protocol))throw Error('invalid_image_response');
 const token=u.searchParams.get('token')!;if(!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))throw Error('invalid_image_response');
 const claims=JSON.parse(Buffer.from(token.split('.')[1]!,'base64url').toString('utf8'));const expiry=Date.parse(d.expiresAt);
 if(claims.url!==decodeURIComponent(u.pathname.slice(prefix.length))||typeof claims.exp!=='number'||!Number.isSafeInteger(claims.exp)||expiry!==claims.exp*1000||expiry<now+5000||expiry-now>604800000)throw Error('invalid_image_response');
 if(c.mode==='transformed'){
  if(claims.format&&claims.format!==''||typeof claims.transformations!=='string')throw Error('invalid_image_response');
  const entries=claims.transformations.split(',').map((x:string)=>x.split(':')),t=Object.fromEntries(entries);if(entries.some((e:string[])=>e.length!==2)||entries.length!==3||Object.keys(t).sort().join(',')!=='quality,resize,width'||t.width!==String(c.expectedWidth)||t.resize!=='contain'||t.quality!=='80')throw Error('invalid_image_response');
 }else if(claims.transformations||claims.format)throw Error('invalid_image_response');
 return value as Grant;
}
