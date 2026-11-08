import {it,expect} from "vitest";
import {parseDisplayQuery,validatePublicMediaGrant} from "../../lib/media/public-authorization";
it("strictly bounds retry, display identifiers and query shape",()=>{
 for(const retry of ['', '?retry=0','?retry=1'])expect(parseDisplayQuery(new URL('https://example.test'+retry)).retry).toBe(retry.endsWith('1')?1:0);
 for(const query of ['?displayId='+ 'x'.repeat(161),'?displayId=','?siteId=1','?key=secret','?cache=1','?url=https://x','?retry=01'])expect(()=>parseDisplayQuery(new URL('https://example.test'+query))).toThrow();
});
it("refuses grants with an unknown origin, identity, signature or extra secret",()=>{
 const id='25000000-0000-4000-8000-000000000001',now=Date.parse('2026-11-08T10:00:00Z');
 const url=new URL('https://storage.example.test/storage/v1/object/sign/bucket/key');const payload=Buffer.from(JSON.stringify({url:'bucket/key',exp:Math.floor(now/1000)+86400})).toString('base64url');url.searchParams.set('token','eyJhbGciOiJIUzI1NiJ9.'+payload+'.c3ludGhldGlj');
 const grant={resourceId:id,version:id,url:url.href,expiresAt:'2026-11-08T10:00:30.000Z',mimeType:'image/webp',byteSize:1024};
 expect(validatePublicMediaGrant(grant,id,[url.origin],now)).toEqual(grant);
 for(const patch of [{resourceId:'other'},{version:'other'},{url:'https://evil.test/x'},{expiresAt:'2026-11-09T10:00:40Z'},{cookie:'secret'}])expect(()=>validatePublicMediaGrant({...grant,...patch},id,[url.origin],now)).toThrow();
 expect(()=>validatePublicMediaGrant(grant,id,[],now)).toThrow();expect(()=>validatePublicMediaGrant(grant,id,[url.origin],now+30000)).toThrow();
});

it("accepts a reused daily CDN capability but rejects another object or untrusted query",()=>{
 const id='25000000-0000-4000-8000-000000000001',now=Date.parse('2026-11-08T10:00:00Z');
 const url=new URL('https://storage.example.test/storage/v1/object/sign/bucket/immutable.webp');
 const payload=Buffer.from(JSON.stringify({url:'bucket/immutable.webp',exp:Math.floor(now/1000)+86400})).toString('base64url');url.searchParams.set('token','eyJhbGciOiJIUzI1NiJ9.'+payload+'.c3ludGhldGlj');
 const grant={resourceId:id,version:id,url:url.href,expiresAt:new Date(now+86400000).toISOString(),mimeType:'image/webp',byteSize:100};
 expect(validatePublicMediaGrant(grant,id,[url.origin],now)).toEqual(grant);
 for(const change of [()=>{url.pathname='/storage/v1/object/sign/bucket/other.webp';},()=>{url.searchParams.set('download','1');}]){
  change();expect(()=>validatePublicMediaGrant({...grant,url:url.href},id,[url.origin],now)).toThrow();
 }
});
