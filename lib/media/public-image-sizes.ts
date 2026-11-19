/** Slot dimensions follow the existing CSS, including the free-height contain cap. */
export function squareImageSizes(ratio:number,columns=3,large=false,fit:'contain'|'cover'='cover',selection=false,fillMobile=false,strip=false){
 const factor=fit==='contain'?Math.min(1,ratio):Math.max(1,ratio*1.25),content='min(100vw, 1440px) - 2 * clamp(24px, 5vw, 80px)';
 const slot=(cols:number,gap:number,span=1,paintedFactor=factor)=>{
  const cell=strip&&cols>1?(cols===2?`calc((${content}) * .48)`:`max(240px, calc((${content}) * .32))`):`calc((${content} - ${(cols-1)*gap}px) / ${cols} * ${span} + ${(span-1)*gap}px)`;
  return fit==='contain'&&selection?`min(${cell}, ${ratio*80}svh)`:`calc(${cell} * ${paintedFactor})`;
 };
 if(!selection&&ratio>1){const horizontalFactor=Math.max(1,ratio*.8);return `(max-width: 600px) ${slot(1,0,1,horizontalFactor)}, (max-width: 767px) ${slot(2,2,1,horizontalFactor)}, (max-width: 950px) ${slot(2,2)}, ${slot(columns,2,large?2:1)}`;}
 const mobile=selection?767:600,tablet=selection?1000:950;
 const small=fillMobile?`${fit==='contain'?'min':'max'}(100vw, ${ratio*100}lvh)`:slot(1,0);
 return `(max-width: ${mobile}px) ${small}, (max-width: ${tablet}px) ${slot(2,2)}, ${slot(columns,2,large?2:1)}`;
}
export function detailImageSizes(ratio:number,fit:'contain'|'cover'='cover'){return `${fit==='contain'?'min':'max'}(100vw, ${ratio*100}svh)`;}
/** Page-builder images crop into 4/5 frames; image grids use 2px gutters. */
export function sectionImageSizes(ratio:number,layout:'grid'|'strip'|'split'='split'){
 const factor=Math.max(1,ratio*1.25),content='min(100vw, 1440px) - 2 * clamp(24px, 5vw, 80px)';
 const slot=(columns:number)=>`calc((${content} - ${(columns-1)*2}px) / ${columns} * ${factor})`;
 if(layout==='grid')return `(max-width: 500px) ${slot(1)}, (max-width: 950px) ${slot(2)}, ${slot(3)}`;
 if(layout==='strip')return `(max-width: 767px) calc((${content}) * .85 * ${factor}), calc(max(240px, calc((${content}) * .35)) * ${factor})`;
 return `(max-width: 767px) ${slot(1)}, calc((${content} - clamp(32px, 6vw, 96px)) / 2 * ${factor})`;
}
/** Portrait cover frames, including the proportional gaps of the 2×2 tiles. */
export function masonryImageSizes(ratio:number,columns=3,large=false){
 const factor=Math.max(1,ratio*1.25),mobileFactor=ratio>1?Math.max(1,ratio*.8):factor,content='min(100vw, 1440px) - 2 * clamp(24px, 5vw, 80px)';
 const slot=(width:string,cols:number,gap:number,span=1,paintedFactor=factor)=>`calc((${width} - ${(cols-1)*gap}px) / ${cols} * ${span} * ${paintedFactor} + ${(span-1)*gap*paintedFactor}px)`;
 return `(max-width: 600px) ${slot('100vw - 16px',1,0,1,mobileFactor)}, (max-width: 767px) ${slot('100vw - 16px',2,8,1,mobileFactor)}, (max-width: 950px) ${slot(content,2,2)}, ${slot(content,columns,2,large?2:1)}`;
}
