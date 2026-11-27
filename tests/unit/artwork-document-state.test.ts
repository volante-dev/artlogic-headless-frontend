import {describe,it,expect} from 'vitest';import {documentBootTransition} from '../../lib/artworks/document-state';
describe('document ownership',()=>{
 it('does not abandon an interactive visit just because loading is slow',()=>{expect(documentBootTransition('preparing','waiting')).toBe('preparing');expect(documentBootTransition('preparing','claim')).toBe('owned');});
 it('only a confirmed script failure can choose static reading before ownership',()=>{expect(documentBootTransition('preparing','script-failed')).toBe('static');expect(documentBootTransition('owned','script-failed')).toBe('owned');expect(documentBootTransition('static','claim')).toBe('static');});
 it('preserves hydration and ownership while the tab is hidden',()=>{expect(documentBootTransition('preparing','hidden')).toBe('preparing');expect(documentBootTransition('preparing','claim')).toBe('owned');expect(documentBootTransition('owned','hidden')).toBe('owned');});
});
