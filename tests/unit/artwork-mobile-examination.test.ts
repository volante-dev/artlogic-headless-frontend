import {it,expect} from "vitest";
import {examinationGeometry,relativePan} from "../../components/artworks/artwork-mobile-examination";
it("fits the whole source and zooms relative to immersive cover",()=>{const fit=examinationGeometry(1536,1024,390,844,1);expect(fit.width).toBe(390);expect(fit.limitY).toBe(0);const zoom=examinationGeometry(1536,1024,390,844,2);expect(zoom.width).toBe(2532);expect(zoom.height).toBe(1688);expect(relativePan({x:0,y:0},50,0,zoom).x).toBeCloseTo(50/zoom.limitX);expect(relativePan({x:0,y:0},9999,9999,zoom)).toEqual({x:1,y:1});});
