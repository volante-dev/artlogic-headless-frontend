export interface FinaleRect {x:number;y:number;width:number;height:number}
export interface ImageSize {width:number;height:number}
/** Source bitmap rect, not CSS frame: this is the coordinate space retained at p=0. */
export function coverBitmap(frame:FinaleRect,image:ImageSize,focus:{x:number;y:number}={x:.5,y:.5}):FinaleRect{
 const scale=Math.max(frame.width/image.width,frame.height/image.height),width=image.width*scale,height=image.height*scale;
 return {x:frame.x+(frame.width-width)*focus.x,y:frame.y+(frame.height-height)*focus.y,width,height};
}
export function initialCrop(bitmap:FinaleRect,frame:FinaleRect):string{
 const top=Math.max(0,frame.y-bitmap.y),left=Math.max(0,frame.x-bitmap.x),bottom=Math.max(0,bitmap.y+bitmap.height-frame.y-frame.height),right=Math.max(0,bitmap.x+bitmap.width-frame.x-frame.width);
 return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
}

/** A common photographic frame, with a cover crop and no texture distortion. */
export function commonFinaleCardRect(viewport:FinaleRect,mobile:boolean,reference:ImageSize):FinaleRect{
 const maxWidth=viewport.width*(mobile?.62:.28),maxHeight=viewport.height*(mobile?.28:.72);
 const ratio=reference.width/reference.height;
 const width=Math.min(maxWidth,maxHeight*ratio),height=width/ratio;
 return {x:viewport.x+viewport.width*(mobile?.08:.57),y:viewport.y+(mobile?40:(viewport.height-height)/2),width,height};
}
export function coverCardTransform(bitmap:FinaleRect,card:FinaleRect){
 const scale=Math.max(card.width/bitmap.width,card.height/bitmap.height),width=bitmap.width*scale,height=bitmap.height*scale;
 const x=card.x-(width-card.width)/2,y=card.y-(height-card.height)/2;
 return {x:x-bitmap.x,y:y-bitmap.y,scale,clip:initialCrop(bitmap,{x:bitmap.x+(width-card.width)/2/scale,y:bitmap.y+(height-card.height)/2/scale,width:card.width/scale,height:card.height/scale})};
}
