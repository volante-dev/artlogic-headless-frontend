import {it,expect} from "vitest";
import {ArtworkVisits} from "../../lib/artworks/navigation";
import {initialMobileState,stableSnapshot} from "../../components/artworks/artwork-mobile-state";
it("merges desktop/mobile snapshots and keeps the 32 visit bound",()=>{const visits=new ArtworkVisits(),snapshot=stableSnapshot(initialMobileState("art",["a"]));visits.rememberVisual("known",{scrollTop:123});visits.rememberVisual("known",{mobile:snapshot});visits.rememberVisual("known",{scrollTop:456});expect(visits.visual("known")).toEqual({scrollTop:456,mobile:snapshot});for(let i=0;i<32;i++)visits.rememberVisual(String(i),{scrollTop:i});expect(visits.visualCount).toBe(32);expect(visits.visual("known")).toBeUndefined();});
