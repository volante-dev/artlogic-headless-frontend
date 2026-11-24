import {describe,it,expect} from "vitest";
import {resolveArtworkView} from "../../lib/artworks/artwork-view";
describe("artwork presentation selection",()=>{
 it.each([undefined,"","generic","future-unknown","LUCAS-RATTON","lucasratton.com"])("keeps the generic fallback for %s",value=>expect(resolveArtworkView(value)).toBe("generic"));
 it("recognizes only the configured dedicated presentation",()=>expect(resolveArtworkView("lucas-ratton")).toBe("lucas-ratton"));
});
