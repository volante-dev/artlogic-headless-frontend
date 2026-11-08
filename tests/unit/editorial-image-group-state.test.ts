import {expect,it} from 'vitest';
import {reconcileImageGroupItem} from '../../lib/editorial/image-group-state';
it('keeps identity after reorder, locale and presentation changes',()=>{expect(reconcileImageGroupItem(['a','b','c'],['c','b','a'],'b')).toBe('b');});
it('selects next at the removed position, then previous, then first',()=>{expect(reconcileImageGroupItem(['a','b','c'],['a','c'],'b')).toBe('c');expect(reconcileImageGroupItem(['a','b','c'],['a','b'],'c')).toBe('b');expect(reconcileImageGroupItem([],['a','b'],null)).toBe('a');expect(reconcileImageGroupItem(['a'],[],'a')).toBeNull();});
