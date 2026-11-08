import{imageCandidates,imageRenditions}from'./public-image-policy.generated';
import{imageUUID,type ImageResource,type ImageDescriptor}from'./public-image-url';
export function physicalImageDescriptor(resource:ImageResource,source:{width:number;height:number;mimeType:string;byteSize?:number},version:string):ImageDescriptor|undefined{
 if(!imageUUID.test(resource.resourceId)||!/^[A-Za-z0-9._-]{1,128}$/.test(version))return;
 const candidates=imageCandidates(source);if(!candidates.length)return;
 return {...resource,sourceVersion:version,policyVersion:'r1',source:{width:source.width,height:source.height,mimeType:source.mimeType as ImageDescriptor['source']['mimeType']},candidates:candidates as ImageDescriptor['candidates']};
}
export function validateImageDescriptor(value:unknown,resource:ImageResource):ImageDescriptor{
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('invalid_descriptor');const d=value as ImageDescriptor;
 const exact=(v:object,keys:string[])=>Object.keys(v).sort().join(',')===keys.sort().join(',');
 if(!exact(d,['resourceKind','resourceId','sourceVersion','policyVersion','source','candidates'])||d.resourceKind!==resource.resourceKind||d.resourceId!==resource.resourceId.toLowerCase()||typeof d.sourceVersion!=='string'||!/^[A-Za-z0-9._-]{1,128}$/.test(d.sourceVersion)||d.policyVersion!=='r1'||!d.source||!exact(d.source,['width','height','mimeType'])||!Number.isSafeInteger(d.source.width)||d.source.width<1||!Number.isSafeInteger(d.source.height)||d.source.height<1||!['image/webp','image/jpeg','image/png','image/gif','image/svg+xml'].includes(d.source.mimeType)||!Array.isArray(d.candidates)||d.candidates.length<1||d.candidates.length>15)throw Error('invalid_descriptor');
 const permitted=imageCandidates(d.source),seen=new Set<number>();
 for(const c of d.candidates){if(!c||!exact(c,['rendition','mode','expectedWidth','expectedHeight'])||!imageRenditions.includes(c.rendition)||seen.has(c.expectedWidth)||!permitted.some(p=>Object.keys(p).every(k=>p[k as keyof typeof p]===c[k as keyof typeof c])))throw Error('invalid_descriptor');seen.add(c.expectedWidth);}
 if(!d.candidates.some(c=>c.mode==='reference'))throw Error('invalid_descriptor');return d;
}
interface Pending{resource:ImageResource;resolve:(d:ImageDescriptor|undefined)=>void;deadline:number;eager:boolean}
/** A provider owns each broker. No cross-request publication or signed URL cache. */
export class ImageDescriptorBroker{
 private pending:Pending[]=[];private active=0;private scheduled=false;
 constructor(private readonly timeoutMs=1500,private readonly request:typeof fetch=fetch){}
 requestDescriptor(resource:ImageResource,eager=false):Promise<ImageDescriptor|undefined>{return new Promise(resolve=>{this.pending.push({resource,resolve,deadline:Date.now()+this.timeoutMs,eager});this.schedule();});}
 private schedule(){if(this.scheduled)return;this.scheduled=true;queueMicrotask(()=>{this.scheduled=false;this.flush();});}
 private flush(){while(this.active<2&&this.pending.length){this.pending.sort((a,b)=>Number(b.eager)-Number(a.eager));const batch:Pending[]=[],keys=new Set<string>();while(this.pending.length){const p=this.pending[0]!,key=p.resource.resourceKind+':'+p.resource.resourceId;if(keys.size===32&&!keys.has(key))break;this.pending.shift();batch.push(p);keys.add(key);}this.active++;void this.run(batch).finally(()=>{this.active--;this.schedule();});}}
 private async run(batch:Pending[]){const resources=[...new Map(batch.map(p=>[p.resource.resourceKind+':'+p.resource.resourceId,p.resource])).values()],timeout=Math.min(...batch.map(p=>p.deadline))-Date.now();
  try{if(timeout<=0)throw Error();const request=this.request;const response=await request('/api/image-descriptors/query',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({resources}),signal:AbortSignal.timeout(timeout)});if(!response.ok)throw Error();const text=await response.text();if(text.length>131072)throw Error();const value=JSON.parse(text);if(!Array.isArray(value.items)||value.items.length>32)throw Error();
   for(const p of batch){const item=value.items.find((x:{resource?:ImageResource})=>x.resource?.resourceKind===p.resource.resourceKind&&x.resource?.resourceId===p.resource.resourceId);try{p.resolve(item?.availability==='available'?validateImageDescriptor(item.descriptor,p.resource):undefined);}catch{p.resolve(undefined);}}
  }catch{batch.forEach(p=>p.resolve(undefined));}
 }
}
