import {describe,it,expect,vi,beforeEach} from 'vitest';
const {read}=vi.hoisted(()=>({read:vi.fn()}));vi.mock('server-only',()=>({}));vi.mock('../../lib/api/client',()=>({publicJson:read,PublicApiError:class extends Error{constructor(readonly status:number,readonly code:string){super(code);}}}));
import {resolveRetiredPath} from '../../lib/i18n/retired-path';
const policy={publicRevision:'7',defaultLocale:'fr',locales:[{code:'fr'}],retiredCodes:['en']} as Parameters<typeof resolveRetiredPath>[1];
beforeEach(()=>read.mockReset());
describe('US4 retired response boundary',()=>{
 it('uses the exact captured revision and a relative current public address',async()=>{read.mockResolvedValue({publicRevision:'7',targetPath:'/publications/current?reader=native',targetKind:'equivalent'});expect(await resolveRetiredPath('/en/publications/old',policy)).toBe('/publications/current?reader=native');expect(read).toHaveBeenCalledWith('/v1/public/languages/redirects/resolve?path=%2Fen%2Fpublications%2Fold&revision=7');});
 it.each(['//evil.test','https://evil.test','/en/contact','/fr/contact','/a/../contact','/%2e%2e/contact','/%2f%2fevil','/contact#bad','/contact\n'])('rejects unsafe or looping target %s',async targetPath=>{read.mockResolvedValue({publicRevision:'7',targetPath,targetKind:'equivalent'});await expect(resolveRetiredPath('/en/contact',policy)).rejects.toMatchObject({status:503});});
 it('rejects stale or extended responses',async()=>{for(const body of [{publicRevision:'8',targetPath:'/',targetKind:'home'},{publicRevision:'7',targetPath:'/',targetKind:'home',extra:true}]){read.mockResolvedValueOnce(body);await expect(resolveRetiredPath('/en/contact',policy)).rejects.toMatchObject({status:503});}});
});
