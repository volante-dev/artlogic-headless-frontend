import {it,expect} from "vitest";
import {ArtworkTouchGesture} from "../../components/artworks/artwork-mobile-gesture";
it("consumes contact until release regardless of animation time, without pointer relocation",()=>{const g=new ArtworkTouchGesture();g.start(1,10,200);expect(g.move(1,11,170)).toBe(1);expect(g.move(1,12,30)).toBe(0);g.end(1);g.start(2,10,200);expect(g.move(2,10,170)).toBe(1);});
it("ignores diagonal, second finger and contacts born during animation",()=>{const g=new ArtworkTouchGesture();g.start(1,0,0);expect(g.move(1,40,30)).toBe(0);g.cancel();g.start(2,0,50,true);expect(g.move(2,0,-100)).toBe(0);g.end(2);g.start(3,0,100);g.start(4,0,100);expect(g.move(3,0,10)).toBe(0);});
