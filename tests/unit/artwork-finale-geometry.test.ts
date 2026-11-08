import {describe,expect,it} from "vitest";
import {coverBitmap,initialCrop,commonFinaleCardRect,coverCardTransform} from "../../lib/artworks/finale-geometry";
describe("finale bitmap geometry",()=>{
 it("preserves the actual cover crop at arbitrary focus",()=>{
  expect(coverBitmap({x:0,y:0,width:900,height:600},{width:600,height:1200},{x:.5,y:.8})).toEqual({x:0,y:-960,width:900,height:1800});
 });
 it("keeps the mobile pile above the reading area without changing its ratio",()=>{
  const target=commonFinaleCardRect({x:0,y:0,width:390,height:844},true,{width:390,height:844});
  expect(target.y).toBeGreaterThanOrEqual(32);expect(target.y+target.height).toBeLessThan(844*.82);expect(target.y+target.height).toBeLessThanOrEqual(844*.33);expect(target.width/target.height).toBeCloseTo(390/844,8);expect(target.x).toBeGreaterThan(0);
 });
});

it("uses the previous slide frame ratio for all photos across all source ratios without distorting the bitmap",()=>{
 const viewport={x:0,y:0,width:1440,height:900},frame={x:720,y:0,width:656,height:900},card=commonFinaleCardRect(viewport,false,frame);
 expect(card.width/card.height).toBeCloseTo(frame.width/frame.height,8);
 for(const image of [{width:1586,height:992},{width:1254,height:1254},{width:1086,height:1448}]){
  const bitmap=coverBitmap(frame,image),t=coverCardTransform(bitmap,card);
  const insets=t.clip.match(/[\d.]+/g)!.map(Number),[top,right,bottom,left]=insets;
  expect((bitmap.width-left-right)*t.scale).toBeCloseTo(card.width,6);
  expect((bitmap.height-top-bottom)*t.scale).toBeCloseTo(card.height,6);
  expect(bitmap.width/bitmap.height).toBeCloseTo(image.width/image.height,8);
 }
});

it("keeps the front photo crop constant throughout a uniform retreat",()=>{
 for(const frame of [{x:720,y:0,width:656,height:842},{x:0,y:0,width:390,height:773}]){
  const bitmap=coverBitmap(frame,{width:1254,height:1254}),card=commonFinaleCardRect({x:0,y:0,width:1440,height:900},false,frame),transform=coverCardTransform(bitmap,card);
  const crop=(text:string)=>text.match(/-?(?:\d*\.?\d+)(?:e[+-]?\d+)?/gi)!.map(Number);
  const before=crop(initialCrop(bitmap,frame)),after=crop(transform.clip);
  before.forEach((v,i)=>expect(after[i]).toBeCloseTo(v,6));
 }
});
