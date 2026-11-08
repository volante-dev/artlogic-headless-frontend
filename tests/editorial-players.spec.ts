import {test,expect} from "@playwright/test";
import {EditorialPlayback,PlaybackArbiter,type EditorialPlayerPort} from "../lib/editorial/playback";
function fake(){let muted=true,playing=false,destroyed=false,denied=false;const port:EditorialPlayerPort={async play(){if(denied)throw new Error("autoplay_denied");playing=true;},async pause(){playing=false;},async setMuted(value){muted=value;},async destroy(){destroyed=true;playing=false;}};return {port,get muted(){return muted;},get playing(){return playing;},get destroyed(){return destroyed;},deny(){denied=true;}};}
test("autoplay stays muted, denial is actionable and manual playback owns the arbiter",async()=>{
 const arbiter=new PlaybackArbiter(),a=fake(),b=fake(),first=new EditorialPlayback(a.port,arbiter),second=new EditorialPlayback(b.port,arbiter);
 first.setVisibility(true);second.setVisibility(true);await first.play(false);expect(a.playing).toBe(true);await second.play(true);expect(b.playing).toBe(false);
 await first.pause();b.deny();await second.play(true);expect(second.snapshot.status).toBe("blocked");expect(b.muted).toBe(true);
 await first.dispose();await second.dispose();expect(a.destroyed).toBe(true);
});
test("a hidden/inactive player pauses and a late play resolution cannot restore its playing state",async()=>{
 let complete:()=>void=()=>{};const value=fake();value.port.play=()=>new Promise<void>(resolve=>{complete=resolve;});
 const player=new EditorialPlayback(value.port,new PlaybackArbiter());player.setVisibility(true);const playing=player.play(true);await new Promise(resolve=>setTimeout(resolve,0));player.setVisibility(false);complete();await playing;expect(player.snapshot.status).not.toBe("playing");await player.dispose();
});
test("changing source destroys the old adapter and no automatic event unmutes the next source",async()=>{
 const arbiter=new PlaybackArbiter(),old=fake(),next=fake(),first=new EditorialPlayback(old.port,arbiter);
 first.setVisibility(true);await first.play(false);await first.toggleSound();expect(old.muted).toBe(false);await first.dispose();
 const second=new EditorialPlayback(next.port,arbiter);second.setVisibility(true);await second.play(true);expect(next.muted).toBe(true);expect(old.destroyed).toBe(true);await second.dispose();
});
test("late provider play events cannot undo an explicit pause",async()=>{
 const value=fake(),player=new EditorialPlayback(value.port,new PlaybackArbiter());player.setVisibility(true);await player.play(false);await player.pause();player.confirmPlaying(true);await new Promise(resolve=>setTimeout(resolve,0));expect(value.playing).toBe(false);expect(player.snapshot.status).toBe("paused");await player.dispose();
});
test("an unresponsive pause destroys the previous adapter before another autoplay starts",async()=>{
 const arbiter=new PlaybackArbiter(),old=fake(),next=fake(),first=new EditorialPlayback(old.port,arbiter),second=new EditorialPlayback(next.port,arbiter);first.setVisibility(true);second.setVisibility(true);await first.play(true);old.port.pause=async()=>{throw new Error("provider_unresponsive");};await second.play(true);expect(old.destroyed).toBe(true);expect(old.playing).toBe(false);expect(next.playing).toBe(true);await second.dispose();
});
