import {it,expect} from "vitest";
import {validateMediaObservation} from "../../lib/media/validate-observation";
it("only projects the closed declarative payload",()=>{
 const event={resourceKind:'artwork',resourceId:'25000000-0000-4000-8000-000000000001',displayId:'doc:1',retry:0,event:'failed',elapsedMs:100};expect(validateMediaObservation(event)).toEqual(event);
 for(const patch of [{url:'secret'},{message:'secret'},{retry:2},{elapsedMs:180001},{event:'authorized'},{stack:'secret'}])expect(()=>validateMediaObservation({...event,...patch})).toThrow();
});
