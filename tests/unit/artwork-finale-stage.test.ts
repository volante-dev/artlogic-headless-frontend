import {describe,expect,it} from "vitest";
import {createFinaleStage,finaleStack,reconcileArtworkStage} from "../../lib/artworks/finale-stage";
describe("finale stages",()=>{
 for(const count of [0,1,2,5,12])it(`keeps real media and max5 cards for ${count} photos`,()=>{
  const ids=Array.from({length:count},(_,i)=>`photo-${i}`),stage=createFinaleStage(ids,ids.at(-1)??null);
  const stack=finaleStack(ids,stage.anchorMediaId);
  expect(stack.length).toBe(Math.min(count,5));expect(new Set(stack).size).toBe(stack.length);expect(stack[0]??null).toBe(ids.at(-1)??null);
 });
 it("anchors shortcuts to the displayed photograph",()=>{
  const ids=["a","b","c","d"];expect(createFinaleStage(ids,"b")).toEqual({kind:"finale",anchorMediaId:"b"});expect(finaleStack(ids,"b")).toEqual(["b","a"]);
 });
 it("reconciles removal without borrowing another artwork",()=>{
  expect(reconcileArtworkStage({kind:"finale",anchorMediaId:"gone"},["a","b"])).toEqual({kind:"finale",anchorMediaId:"b"});
  expect(reconcileArtworkStage({kind:"photo",mediaId:"gone"},[])).toEqual({kind:"overview"});
  expect(reconcileArtworkStage({kind:"finale",anchorMediaId:"gone"},[])).toEqual({kind:"finale",anchorMediaId:null});
 });
});
