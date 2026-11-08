import{it,expect,vi}from'vitest';
import{ImageDescriptorBroker,validateImageDescriptor,physicalImageDescriptor}from'../../lib/media/public-image-descriptor';
it('chunks and completes more than 32 unique resources with at most two calls active',async()=>{
 let active=0,max=0;const request=vi.fn(async(_url:unknown,init?:RequestInit)=>{active++;max=Math.max(max,active);const body=JSON.parse(String(init?.body));expect(body.resources.length).toBeLessThanOrEqual(32);await new Promise(r=>setTimeout(r,5));active--;return Response.json({items:body.resources.map((resource:unknown)=>({resource,availability:'unavailable'}))});});
 const broker=new ImageDescriptorBroker(1500,request),resources=Array.from({length:70},(_,i)=>({resourceKind:'artwork' as const,resourceId:'20000000-0000-4000-8000-'+String(i).padStart(12,'0')}));
 expect((await Promise.all(resources.map(r=>broker.requestDescriptor(r)))).every(x=>x===undefined)).toBe(true);expect(request).toHaveBeenCalledTimes(3);expect(max).toBe(2);
});
it('deduplicates pending references and treats metadata failure locally',async()=>{
 const request=vi.fn(async(_url:unknown,init?:RequestInit)=>{expect(JSON.parse(String(init?.body)).resources).toHaveLength(1);return new Response(null,{status:503});}),broker=new ImageDescriptorBroker(1500,request),resource={resourceKind:'artwork' as const,resourceId:'20000000-0000-4000-8000-000000000001'};
 expect(await Promise.all([broker.requestDescriptor(resource),broker.requestDescriptor(resource)])).toEqual([undefined,undefined]);expect(request).toHaveBeenCalledTimes(1);
});
it('requires physical dimensions and rejects dishonest widths and extra fields',()=>{
 const resource={resourceKind:'artwork' as const,resourceId:'20000000-0000-4000-8000-000000000001'},d=physicalImageDescriptor(resource,{width:400,height:800,mimeType:'image/webp'},resource.resourceId+'.ref')!;
 expect(validateImageDescriptor(d,resource)).toEqual(d);expect(()=>validateImageDescriptor({...d,storageKey:'secret'},resource)).toThrow();expect(()=>validateImageDescriptor({...d,candidates:[{rendition:'r1-w640',mode:'transformed',expectedWidth:640,expectedHeight:1280}]},resource)).toThrow();expect(physicalImageDescriptor(resource,{width:0,height:0,mimeType:'image/webp'},'v')).toBeUndefined();
});
it('bounds the whole queued batch completion and falls back unresolved items locally',async()=>{
 const request=vi.fn((_url:unknown,init?:RequestInit)=>new Promise<Response>((_resolve,reject)=>{init?.signal?.addEventListener('abort',()=>reject(Error('test_timeout')),{once:true});})),broker=new ImageDescriptorBroker(20,request),resources=Array.from({length:70},(_,i)=>({resourceKind:'artwork' as const,resourceId:'20000000-0000-4000-8000-'+String(i).padStart(12,'0')}));
 expect((await Promise.all(resources.map(r=>broker.requestDescriptor(r)))).every(x=>x===undefined)).toBe(true);expect(request.mock.calls.length).toBeLessThanOrEqual(3);
});

it('does not bind native fetch to the broker object',async()=>{const request=function(this:unknown){expect(this===undefined||this===globalThis).toBe(true);return Promise.resolve(Response.json({items:[]}));};const broker=new ImageDescriptorBroker(1500,request);expect(await broker.requestDescriptor({resourceKind:'artwork',resourceId:'20000000-0000-4000-8000-000000000001'})).toBeUndefined();});
