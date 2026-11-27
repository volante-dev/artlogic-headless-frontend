import {beforeEach,expect,it,vi} from 'vitest';
const {read}=vi.hoisted(()=>({read:vi.fn()}));
vi.mock('server-only',()=>({}));
vi.mock('../../lib/i18n/runtime-policy',()=>({readRuntimeLanguagePolicy:read}));
import {admissionLanguageHeaders} from '../../lib/i18n/admission-language';
beforeEach(()=>read.mockReset());
it('reconstructs runtime headers from a fresh server read on every standalone admission',async()=>{
 read.mockResolvedValueOnce({kind:'runtime',policy:{publicRevision:'7'}}).mockResolvedValueOnce({kind:'runtime',policy:{publicRevision:'8'}});
 expect(await admissionLanguageHeaders()).toEqual({'X-Site-Language-Contract':'1','X-Site-Language-Revision':'7'});
 expect(await admissionLanguageHeaders()).toEqual({'X-Site-Language-Contract':'1','X-Site-Language-Revision':'8'});expect(read).toHaveBeenCalledTimes(2);
});
it('closes admissions explicitly when the managed policy is unavailable',async()=>{
 read.mockResolvedValue({kind:'unavailable',reason:'unavailable'});
 await expect(admissionLanguageHeaders()).rejects.toThrow('language_policy_unavailable');
});
