import {it,expect,vi} from "vitest";
import {ArtworkOpening,simpleArtworkOpeningDuration} from "../../components/artworks/artwork-opening";

function paper(){return {style:{opacity:"",willChange:"",backdropFilter:""},dataset:{},inert:false} as unknown as HTMLElement;}
it("publishes backdrop visibility when a visit closes",()=>{
 const opening=new ArtworkOpening(),visibility:boolean[]=[];
 expect(opening.isClosing).toBe(false);
 opening.subscribe(()=>visibility.push(opening.hasPaper));
 opening.register("paper",paper());expect(visibility.at(-1)).toBe(true);
 opening.close();expect(visibility.at(-1)).toBe(false);expect(opening.isClosing).toBe(true);
 opening.begin();expect(opening.isClosing).toBe(false);opening.close();
});
it("keeps the backdrop visible across synchronous shell replacement",async()=>{
 const opening=new ArtworkOpening(),visibility:boolean[]=[];
 const detach=opening.register("paper",paper());opening.subscribe(()=>visibility.push(opening.hasPaper));
 detach();opening.register("paper",paper());await Promise.resolve();
 expect(visibility.length).toBeGreaterThan(0);expect(visibility.every(Boolean)).toBe(true);
 opening.close();
});
it("holds the backdrop across asynchronous route gaps until the visit closes",async()=>{
 const opening=new ArtworkOpening();const detach=opening.register("paper",paper());
 detach();await Promise.resolve();expect(opening.hasPaper).toBe(false);expect(opening.isOpen).toBe(true);
 opening.register("paper",paper());expect(opening.isOpen).toBe(true);
 opening.close();expect(opening.isOpen).toBe(false);
});

it("simple entrance never waits for the image series or disables controls",()=>{vi.useFakeTimers();try{const opening=new ArtworkOpening("simple"),controls=paper();opening.begin();opening.register("controls",controls);expect(controls.inert).toBe(false);expect(opening.phase).not.toBe("waiting");vi.advanceTimersByTime(simpleArtworkOpeningDuration+20);expect(opening.phase).toBe("complete");opening.close();}finally{vi.useRealTimers();}});
it("reveals late content once per visit, independently of the shell clock",()=>{vi.useFakeTimers();try{const opening=new ArtworkOpening("simple");opening.begin();vi.advanceTimersByTime(1000);expect(opening.phase).toBe("complete");expect(opening.claimContentReveal()).toBe(true);expect(opening.claimContentReveal()).toBe(false);opening.begin();expect(opening.claimContentReveal()).toBe(true);opening.close();}finally{vi.useRealTimers();}});
