import {it,expect} from "vitest";
import {informationPresentation} from "../../lib/artworks/mobile-information-presentation";
it("reverses one presentation, rejects stale callbacks and restores at the endpoint",()=>{
 const p=informationPresentation(true);expect(p.progress).toBe(1);expect(p.phase).toBe("reading");
 const epoch=p.epoch;for(let i=0;i<20;i++){p.target(i%2===0);p.update(.1+(i%5)*.04);expect(p.phase).toBe(p.targetOpen?"width":"returning");}
 p.rebuild();expect(p.valid(epoch)).toBe(false);expect(p.epoch).toBeGreaterThan(epoch);
 p.target(false);p.update(0);expect(p.phase).toBe("closed");
});
