import {describe,it,expect} from "vitest";
import {newRattonVisit,reconcileRattonVisit,moveRattonPhoto,rattonPhotoWindow} from "../../components/artworks/ratton/ratton-artwork-state";
describe("a Ratton artwork visit",()=>{
 const ids=["a","b","c","d"];
 it("starts at the first photo with independent reading and zoom",()=>expect(newRattonVisit("work",ids,"visit")).toMatchObject({visitKey:"visit",artworkId:"work",selectedMediaId:"a",informationScrollTop:0,zoomMediaId:null,closing:false}));
 it("handles an empty series",()=>{const s=newRattonVisit("work",[],"visit");expect(s.selectedMediaId).toBeNull();expect(rattonPhotoWindow([],null)).toEqual([]);expect(moveRattonPhoto(s,[],1)).toBe(s);});
 it("bounds navigation without looping or losing the text scroll",()=>{const s={...newRattonVisit("work",ids,"visit"),informationScrollTop:140};expect(moveRattonPhoto(s,ids,-1).selectedMediaId).toBe("a");const last=moveRattonPhoto(s,ids,999);expect(last.selectedMediaId).toBe("d");expect(last.informationScrollTop).toBe(140);expect(moveRattonPhoto(last,ids,1).selectedMediaId).toBe("d");});
 it("prepares only the immediate neighbors in public order",()=>{expect(rattonPhotoWindow(ids,"a")).toEqual(["a","b"]);expect(rattonPhotoWindow(ids,"b")).toEqual(["a","b","c"]);expect(rattonPhotoWindow(ids,"d")).toEqual(["c","d"]);expect(rattonPhotoWindow(["a"],"a")).toEqual(["a"]);});
 it("retains an authorized selection across revalidation, then resets a new visit",()=>{const s={...newRattonVisit("work",ids,"visit"),selectedMediaId:"c",informationScrollTop:200};expect(reconcileRattonVisit(s,ids)).toBe(s);expect(newRattonVisit("work",ids,"new")).toMatchObject({selectedMediaId:"a",informationScrollTop:0,visitKey:"new"});});
 it("reconciles removed media and closes its zoom",()=>{const s={...newRattonVisit("work",ids,"visit"),selectedMediaId:"c",zoomMediaId:"c"};expect(reconcileRattonVisit(s,["a","b"])).toMatchObject({selectedMediaId:"a",zoomMediaId:null});expect(reconcileRattonVisit(s,[]).selectedMediaId).toBeNull();});
 it("does not accept navigation while closing or zoomed",()=>{for(const state of [{closing:true},{zoomMediaId:"a"}]){const s={...newRattonVisit("work",ids,"visit"),...state};expect(moveRattonPhoto(s,ids,1)).toBe(s);}});
});
