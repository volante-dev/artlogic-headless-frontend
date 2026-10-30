import {it,expect} from "vitest";
import {artworkScrollTarget,artworkScrollUnsettled,artworkScrollEase} from "../../components/artworks/artwork-scroll-sequence";
it("completes each transition in either direction without a rest point between slides",()=>{
 expect(artworkScrollTarget(0,900,900,3,1)).toBe(900);
 expect(artworkScrollTarget(450,900,900,3,1)).toBe(900);
 expect(artworkScrollTarget(450,900,900,3,-1)).toBe(0);
 expect(artworkScrollTarget(900,900,900,3,1)).toBe(1800);
 expect(artworkScrollTarget(1800,900,900,3,1)).toBe(2700);
 expect(artworkScrollTarget(2700,900,900,3,-1)).toBe(1800);
 expect(artworkScrollTarget(1800,900,900,3,-1)).toBe(900);
 expect(artworkScrollTarget(900,900,900,3,-1)).toBe(0);
 for(const y of [450,1200,2400])expect(artworkScrollUnsettled(y,900,900,3)).toBe(true);
 for(const y of [0,900,1800,2700])expect(artworkScrollUnsettled(y,900,900,3)).toBe(false);
 expect(artworkScrollEase(0)).toBe(0);expect(artworkScrollEase(1)).toBe(1);
});
it("keeps long text and sections after the scene freely scrollable",()=>{
 expect(artworkScrollTarget(1200,900,2400,3,1)).toBeNull();expect(artworkScrollTarget(1200,900,2400,3,-1)).toBeNull();
 expect(artworkScrollUnsettled(1200,900,2400,3)).toBe(false);
 expect(artworkScrollTarget(2400,900,2400,3,1)).toBe(3300);
 expect(artworkScrollTarget(3300,900,2400,3,-1)).toBe(2400);
 expect(artworkScrollTarget(5000,900,2400,3,-1)).toBeNull();
 for(const count of [0,1])expect(artworkScrollTarget(900,900,900,count,1)).toBeNull();
});
