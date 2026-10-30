import {describe,it,expect} from "vitest";
import {artworkProgress,artworkStageOffsets} from "../../components/artworks/artwork-progress";
describe("artwork scroll progression",()=>{
  it("keeps the fullscreen arrival and shrink in the first real view",()=>{
    expect(artworkStageOffsets(900,900,3)).toEqual([0,1800,2700]);
    expect(artworkProgress(0,900,900,3)).toEqual({transition:0,active:0});
    expect(artworkProgress(450,900,900,3)).toEqual({transition:.5,active:0});
    expect(artworkProgress(900,900,900,3)).toEqual({transition:1,active:0});
    expect(artworkProgress(1800,900,900,3)).toEqual({transition:1,active:1});
    expect(artworkProgress(9999,900,900,3)).toEqual({transition:1,active:2});
    expect(artworkProgress(300,900,900,3).active).toBe(0);
  });
  it("has one informative presentation for a missing or unique image, no invented destinations",()=>{
    for(const count of [0,1]){expect(artworkStageOffsets(900,2400,count)).toEqual([0]);expect(artworkProgress(9999,900,2400,count).active).toBe(0);}
    expect(artworkStageOffsets(640,2400,7)).toHaveLength(7);
  });
});
