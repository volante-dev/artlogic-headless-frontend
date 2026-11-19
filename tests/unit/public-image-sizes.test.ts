import{it,expect}from'vitest';
import{squareImageSizes,detailImageSizes,masonryImageSizes,sectionImageSizes}from'../../lib/media/public-image-sizes';
it('bounds a free-height contain selection by both its column and the 80svh image limit',()=>{
 const sizes=squareImageSizes(.5,3,false,'contain',true);
 expect(sizes).toContain('min(calc(');expect(sizes).toContain('40svh)');
 // A portrait in a free-height cell is not constrained to half the column width.
 expect(sizes).not.toContain('* 0.5');
});
it('sizes the portrait masonry crop and 2x2 spans with the denser gaps',()=>{
 const portrait=masonryImageSizes(.8,3),landscape=masonryImageSizes(2,3,true);
 expect(portrait).toContain('(max-width: 600px) calc((100vw - 16px - 0px) / 1 * 1 * 1 + 0px)');
 expect(portrait).toContain('(max-width: 767px) calc((100vw - 16px - 8px) / 2');
 expect(landscape).toContain('/ 3 * 2 * 2.5 + 5px)');
 expect(squareImageSizes(2)).toContain('/ 3 * 1 + 0px) * 2.5');
});
it('keeps a cover crop and mobile full-height contain frame independently sized',()=>{
 expect(squareImageSizes(2,3,false,'cover')).toContain('* 2.5');
 expect(squareImageSizes(.5,3,false,'contain',true,true)).toContain('min(100vw, 50lvh)');
 expect(detailImageSizes(.5)).toBe('max(100vw, 50svh)');
});

it('accounts for the portrait page selection and its 2px gaps',()=>{
 expect(squareImageSizes(.8,3,false,'cover',true)).toContain('- 4px) / 3');
 expect(squareImageSizes(.8,3,false,'cover',true)).toContain('* 1');
});

it('sizes portrait image galleries for their grid and strip layouts',()=>{
 expect(sectionImageSizes(2,'grid')).toContain('(max-width: 950px)');
 expect(sectionImageSizes(2,'grid')).toContain('- 4px) / 3 * 2.5');
 expect(sectionImageSizes(2,'strip')).toContain('* .85 * 2.5');
});

it('uses 5/4 crops for horizontal first images in the mobile catalogue only',()=>{
 expect(masonryImageSizes(2)).toContain('(max-width: 600px) calc((100vw - 16px - 0px) / 1 * 1 * 1.6 + 0px)');
 expect(masonryImageSizes(2)).toContain('/ 3 * 1 * 2.5');
 expect(squareImageSizes(2)).toContain('(max-width: 767px)');
 expect(squareImageSizes(2,3,false,'cover',true)).not.toContain('* 1.6');
});
