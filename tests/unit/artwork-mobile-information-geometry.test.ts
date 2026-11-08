import {describe,it,expect} from "vitest";
import {informationGeometry} from "../../lib/artworks/mobile-information-geometry";
describe("measured mobile information geometry",()=>{
 it("keeps dimensions finite and nonnegative with unavailable viewport metrics",()=>{
  const g=informationGeometry({viewport:{width:NaN,height:0},closed:{left:16,top:0,width:0,height:80},insets:{left:16,right:16,top:24,bottom:24},identityHeight:20,actionsHeight:44,lineHeight:24,padding:18,gap:16});
  for(const rect of [g.closed,g.horizontal,g.open])for(const n of Object.values(rect)){expect(Number.isFinite(n)).toBe(true);expect(n).toBeGreaterThanOrEqual(0);}
 });
 for(const width of [320,390,430,844])it(`anchors both axes and provides two readable lines at ${width}`,()=>{
  const g=informationGeometry({viewport:{width,height:width===844?390:844},closed:{left:16,top:620,width:width-120,height:200},insets:{left:16,right:16,top:24,bottom:24},identityHeight:88,actionsHeight:110,lineHeight:28,padding:18,gap:16});
  expect(g.horizontal.top).toBe(g.closed.top);expect(g.horizontal.height).toBe(g.closed.height);
  expect(g.open.left).toBe(g.closed.left);expect(g.open.top+g.open.height).toBe(g.closed.top+g.closed.height);
  expect(g.open.width).toBe(width-32);expect(g.readerHeight).toBeGreaterThanOrEqual(56);expect(g.border).toBe(1);
  expect(Object.values(g.open).every(Number.isFinite)).toBe(true);
 });
 it("uses a shared compact reader when measured identity and 200% actions consume normal space",()=>{
  const g=informationGeometry({viewport:{width:844,height:390},closed:{left:16,top:190,width:340,height:176},insets:{left:16,right:16,top:24,bottom:24},identityHeight:180,actionsHeight:136,lineHeight:36,padding:14,gap:12});
  expect(g.compact).toBe(true);expect(g.readerHeight).toBeGreaterThanOrEqual(72);
 });
});
