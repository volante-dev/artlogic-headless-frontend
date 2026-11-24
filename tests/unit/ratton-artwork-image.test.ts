import {it,expect} from "vitest";
import {rattonArtworkImageSizes} from "../../lib/artworks/ratton-artwork-image";
it("bounds contain candidates by both the viewport height and the media column",()=>{for(const ratio of [.5,1,2]){const sizes=rattonArtworkImageSizes(ratio);expect(sizes).toContain("(max-width: 959px)");expect(sizes).toContain("(max-height: 639px)");expect(sizes).toContain("min(");expect(sizes).toContain("100svh");expect(sizes).not.toContain("max(");}});
it("does not emit invalid CSS dimensions for absent metadata",()=>{for(const ratio of [NaN,Infinity,-1,0])expect(rattonArtworkImageSizes(ratio)).toBe(rattonArtworkImageSizes(1));});
