import {commerceOperations} from "./operations.generated";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function publicCommerceOperation(method:string,segments:readonly string[]){
 const normalized=segments.length===1&&segments[0]==="guest-session"?["guest-sessions"]:segments;
 if(normalized.length>5||normalized.some(s=>!s||s.length>100||/[./\\?#%]/.test(s)))return null;
 for(const op of commerceOperations){
  if(op.area!=="internal"||op.method!==method)continue;
  const pieces=op.path.replace('/v1/internal/store/','').split('/');if(pieces.length!==normalized.length)continue;
  if(pieces.every((p,i)=>p.startsWith('{')?uuid.test(normalized[i]!):p===normalized[i]))return {...op,resolvedPath:'/v1/internal/store/'+normalized.map(encodeURIComponent).join('/')};
 }
 return null;
}
