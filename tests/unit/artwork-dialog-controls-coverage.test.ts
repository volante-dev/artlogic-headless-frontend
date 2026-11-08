import {it,expect} from "vitest";
import {controlsCoverage} from "../../components/artworks/artwork-dialog-controls-coverage";
it("isolates shells and restores only after the last lease, with idempotent stale release",()=>{
 const a:number[]=[],b:number[]=[];const one=controlsCoverage((n)=>a.push(n)),two=controlsCoverage(n=>b.push(n));
 const old=one.acquire(),current=one.acquire(),other=two.acquire();old.update(1);current.update(.5);old.release();old.release();old.update(1);expect(one.active).toBe(true);expect(a.at(-1)).toBe(.5);
 other.update(2);expect(b.at(-1)).toBe(1);current.release();expect(one.active).toBe(false);expect(a.at(-1)).toBe(0);expect(two.active).toBe(true);
});
