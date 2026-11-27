import {describe,it,expect,vi,beforeEach} from 'vitest';
import {nativeEditorLanguageHeaders} from '../../../web-admin/lib/site-languages/business-contract';
const read=vi.fn(),adminLanguageBusinessHeaders=(path:string,session?:string)=>nativeEditorLanguageHeaders(path,session,read);
describe('US2 trusted native editor language context',()=>{
 beforeEach(()=>read.mockReset());
 it('reconstructs only the runtime public revision for localized JSON, with the authenticated session',async()=>{
  read.mockResolvedValue({policy:{revision:'12',publicRevision:'7'}});expect(await adminLanguageBusinessHeaders('/v1/admin/editorial/capabilities','synthetic-session')).toEqual({'X-Site-Language-Contract':'1','X-Site-Language-Revision':'7'});expect(read).toHaveBeenCalledWith('synthetic-session');
  expect(await adminLanguageBusinessHeaders('/v1/admin/inventory/artworks/11111111-1111-4111-8111-111111111111/draft','synthetic-session')).toEqual({'X-Site-Language-Contract':'1','X-Site-Language-Revision':'7'});
 });
 it('bypasses images, auth, language control and technical requests without an extra policy lookup',async()=>{
  for(const path of ['/v1/admin/presentation/assets','/v1/admin/editorial/media/abc','/v1/admin/site-favicon','/v1/admin/languages','/v1/admin/session','/health/live','/v1/admin/inventory/documents','/v1/admin/inventory/artworks/11111111-1111-4111-8111-111111111111/private-notes'])expect(await adminLanguageBusinessHeaders(path,'synthetic-session')).toEqual({});expect(read).not.toHaveBeenCalled();
 });
 it('keeps a confirmed old API on its prior contract but never downgrades an authorization failure or an outage',async()=>{
  read.mockResolvedValue({policy:null});expect(await adminLanguageBusinessHeaders('/v1/admin/forms')).toEqual({});for(const status of [401,403,503]){read.mockRejectedValueOnce({status});await expect(adminLanguageBusinessHeaders('/v1/admin/forms')).rejects.toMatchObject({status});}
 });
});
