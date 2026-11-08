import{it,expect,vi,afterEach}from'vitest';
vi.mock('server-only',()=>({}));
vi.mock('@/lib/config/env',()=>({loadConfig:()=>({BACKEND_URL:'https://api.example.test',PUBLIC_IMAGE_DESCRIPTOR_TIMEOUT_MS:1500,PUBLIC_PAGE_REQUEST_TIMEOUT_MS:45000,PUBLIC_MEDIA_DELIVERY_ORIGINS_JSON:['https://storage.example.test']}),numberValue:(c:Record<string,number>,k:string)=>c[k],stringValue:(c:Record<string,string>,k:string)=>c[k],listValue:(c:Record<string,string[]>,k:string)=>c[k]}));
// The helper imports the same env module through a relative specifier.
vi.mock('../../lib/config/env',()=>({loadConfig:()=>({BACKEND_URL:'https://api.example.test',PUBLIC_IMAGE_DESCRIPTOR_TIMEOUT_MS:1500,PUBLIC_PAGE_REQUEST_TIMEOUT_MS:45000,PUBLIC_MEDIA_DELIVERY_ORIGINS_JSON:['https://storage.example.test']}),numberValue:(c:Record<string,number>,k:string)=>c[k],stringValue:(c:Record<string,string>,k:string)=>c[k],listValue:(c:Record<string,string[]>,k:string)=>c[k]}));
import{relayResponsiveImage}from'../../lib/media/public-image-http';
import{validateImageGrant}from'../../lib/media/public-image-authorization';
const id='20000000-0000-4000-8000-000000000001',resource={resourceKind:'artwork' as const,resourceId:id};
afterEach(()=>vi.unstubAllGlobals());
it('uses only an unsigned descriptor for HEAD, without invoking the signing endpoint or storage',async()=>{
 const fetch=vi.fn(async(_input:unknown,_init?:RequestInit)=>Response.json({items:[{resource,availability:'available',descriptor:{...resource,sourceVersion:id+'.ref',policyVersion:'r1',source:{width:1920,height:1280,mimeType:'image/webp'},candidates:[{rendition:'r1-reference',mode:'reference',expectedWidth:1920,expectedHeight:1280}]}}]}));vi.stubGlobal('fetch',fetch);
 const result=await relayResponsiveImage(new Request('https://site.example.test/media/'+id+'?image=r1-w320&v='+id+'.ref',{method:'HEAD'}),id,'artwork',true);expect(result.status).toBe(200);expect(result.headers.get('content-length')).toBeNull();expect(fetch).toHaveBeenCalledTimes(1);expect(String(fetch.mock.calls[0]?.[0])).toContain('/image-descriptors/query');
});
it('checks identity, expected dimensions and native transform claims independently',()=>{
 const now=Date.now(),exp=Math.floor(now/1000)+3600,payload={url:'bucket/site/photo.webp',exp,transformations:'width:320,resize:contain,quality:80'},token='synthetic.'+Buffer.from(JSON.stringify(payload)).toString('base64url')+'.signature';
 const g={...resource,sourceVersion:id+'.ref',policyVersion:'r1',requestedRendition:'r1-w320',canonicalRendition:'r1-w320',source:{width:1920,height:1280,mimeType:'image/webp',byteSize:10000},representation:{mode:'transformed',expectedWidth:320,expectedHeight:213,mimeType:null,byteSize:null},delivery:{url:'https://storage.example.test/storage/v1/render/image/sign/bucket/site/photo.webp?token='+token,expiresAt:new Date(exp*1000).toISOString()}};
 expect(validateImageGrant(g,resource,id+'.ref','r1-w320',['https://storage.example.test'],now)).toEqual(g);
 for(const patch of [{resourceId:'other'},{storageKey:'secret'},{representation:{...g.representation,byteSize:10000}},{delivery:{...g.delivery,url:g.delivery.url+'&width=160'}}])expect(()=>validateImageGrant({...g,...patch},resource,id+'.ref','r1-w320',['https://storage.example.test'],now)).toThrow();
});
