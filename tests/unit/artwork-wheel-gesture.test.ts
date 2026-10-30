import {readFileSync} from "node:fs";
import {afterEach,it,expect,vi} from "vitest";
import type {WheelEventData} from "wheel-gestures";
import {createArtworkWheelGesture} from "../../components/artworks/artwork-wheel-gesture";
afterEach(()=>{vi.clearAllTimers();vi.useRealTimers();});
it.each(["swipe-up-trackpad","swipe-up-fast-trackpad","swipe-down-trackpad","swipe-down-fast-trackpad"])("accepts one step for a recorded Mac trackpad gesture including inertia: %s",name=>{
 vi.useFakeTimers();const gate=createArtworkWheelGesture(),record=JSON.parse(readFileSync(new URL(`../../node_modules/wheel-gestures/src/test/fixtures/${name}.json`,import.meta.url),"utf8")) as {wheelEvents:WheelEventData[]};
 let accepted=0,previous=record.wheelEvents[0]!.timeStamp;
 try{for(const event of record.wheelEvents){vi.advanceTimersByTime(Math.max(0,event.timeStamp-previous));if(gate.accept(event))accepted++;previous=event.timeStamp;}expect(accepted).toBe(1);}finally{gate.dispose();}
});
it("ignores native momentum beyond animation end and accepts the next physical gesture immediately",()=>{
 vi.useFakeTimers();const gate=createArtworkWheelGesture();let time=0;
 const feed=(deltaY:number,momentum:boolean)=>{time+=16;vi.advanceTimersByTime(16);return gate.accept({deltaMode:0,deltaX:0,deltaY,timeStamp:time,momentum});};
 try{
  expect(feed(12,false)).toBe(true);for(let i=0;i<80;i++)expect(feed(12-i*.1,true)).toBe(false);
  expect(feed(8,false)).toBe(true);for(let i=0;i<80;i++)expect(feed(8-i*.05,true)).toBe(false);
  expect(feed(-8,false)).toBe(true);
 }finally{gate.dispose();}
});
