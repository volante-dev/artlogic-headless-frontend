import{it,expect}from'vitest';
import{squareImageSizes,detailImageSizes}from'../../lib/media/public-image-sizes';
it('bounds a free-height contain selection by both its column and the 80svh image limit',()=>{
 const sizes=squareImageSizes(.5,3,false,'contain',true);
 expect(sizes).toContain('min(calc(');expect(sizes).toContain('40svh)');
 // A portrait in a free-height cell is not constrained to half the column width.
 expect(sizes).not.toContain('* 0.5');
});
it('keeps a cover crop and mobile full-height contain frame independently sized',()=>{
 expect(squareImageSizes(2,3,false,'cover')).toContain('* 2');
 expect(squareImageSizes(.5,3,false,'contain',true,true)).toContain('min(100vw, 50svh)');
 expect(detailImageSizes(.5)).toBe('max(100vw, 50svh)');
});
