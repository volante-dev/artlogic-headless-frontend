import {it,expect} from "vitest";
import {MediaDisplayAttempt} from "../../lib/media/display-state";
import {parseDisplayQuery} from "../../lib/media/public-authorization";
it("retains the stable src, retries once and preserves its global budget",()=>{
 let now=0;const attempt=new MediaDisplayAttempt("/media/id","doc:1",60000,()=>now);
 expect(attempt.snapshot().src).toBe("/media/id?displayId=doc%3A1");attempt.start();now=30000;attempt.fail();expect(attempt.snapshot().src).toBe("/media/id?retry=1&displayId=doc%3A1");expect(attempt.remaining()).toBe(30000);attempt.fail();expect(attempt.snapshot().status).toBe("fallback");attempt.fail();expect(attempt.snapshot().retry).toBe(1);
});
it("does not expire already loaded bytes and permits explicit restart",()=>{const a=new MediaDisplayAttempt("/media/id","1",60000);a.loaded();a.timeout();expect(a.snapshot().status).toBe("loaded");a.restart();expect(a.snapshot().status).toBe("idle");});
it("rejects arbitrary URLs and unbounded retry parameters",()=>{for(const query of ['?retry=2','?url=https://x','?retry=1&retry=0','?displayId=https://x'])expect(()=>parseDisplayQuery(new URL('https://example.test/media/id'+query))).toThrow();});
it("retains one loaded observation across consumers and makes explicit restarts identifiable",()=>{
 const a=new MediaDisplayAttempt('/media/id','doc:1',60000);a.loaded();expect(a.claimLoaded()).toBe(true);expect(a.claimLoaded()).toBe(false);a.restart();expect(a.snapshot().displayId).toBe('doc:1.manual1');expect(a.claimLoaded()).toBe(true);
});

it("suspends the transfer deadline while hidden",()=>{let now=0;const a=new MediaDisplayAttempt('/media/id','1',60000,()=>now);a.start();now=10000;a.pause();now=310000;a.resume();expect(a.remaining()).toBe(50000);});
