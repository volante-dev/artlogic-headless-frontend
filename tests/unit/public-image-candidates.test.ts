import {it,expect}from'vitest';
import vectors from '../fixtures/public-image-policy.json';
import {selectImageCandidate,paintedWidth}from'../../lib/media/public-image-policy.generated';
import {imageUrl,parseImageQuery,buildImageAttributes}from'../../lib/media/public-image-url';
const resource={resourceKind:'artwork' as const,resourceId:'20000000-0000-4000-8000-000000000001'};
it('uses the same physical vectors as the API',()=>{for(const v of vectors){const need=Math.ceil(paintedWidth(v.source,v.box[0],v.box[1],v.fit as 'contain'|'cover')*v.dpr);expect(selectImageCandidate(v.source,need)).toMatchObject({rendition:v.rendition,expectedWidth:v.width});}});
it('keeps canonical aliases free of diagnostic cache busters',()=>{
 const url=imageUrl(resource,resource.resourceId+'.ref','r1-w320');expect(url).toBe('/media/'+resource.resourceId+'?image=r1-w320&v='+resource.resourceId+'.ref');expect(parseImageQuery(new URL(url,'https://example.test'))).toMatchObject({rendition:'r1-w320',version:resource.resourceId+'.ref'});
 for(const query of ['?image=r1-w320&v=x&displayId=x','?image=r1-w320&v=x&variant=w640','?image=r1-w320&image=r1-w640&v=x','?image=bad&v=x'])expect(()=>parseImageQuery(new URL('https://example.test/'+query))).toThrow();
});
it('uses effective intrinsic widths rather than selector numbers',()=>{
 const descriptor={...resource,sourceVersion:resource.resourceId+'.ref',policyVersion:'r1' as const,source:{width:1000,height:10000,mimeType:'image/webp' as const},candidates:[{rendition:'r1-w256' as const,mode:'transformed' as const,expectedWidth:250,expectedHeight:2500},{rendition:'r1-reference' as const,mode:'reference' as const,expectedWidth:1000,expectedHeight:10000}]};
 expect(buildImageAttributes(descriptor,'100vw').srcSet).toContain(' 250w');expect(buildImageAttributes(descriptor,'100vw').srcSet).not.toContain(' 256w');
});
