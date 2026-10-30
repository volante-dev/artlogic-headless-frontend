import {describe,it,expect} from "vitest";
import {ArtworkVisits,type ArtworkOrigin} from "../../lib/artworks/navigation";
const origin=(n=0):ArtworkOrigin=>({href:"/artworks?q=study&page=2#grid"+n,locale:"fr",scrollX:0,scrollY:600+n,focus:{href:"/artworks/art-"+n,index:n}});
describe("document-scoped artwork visits",()=>{
  it("commits exactly one canonical entry and rejects cancelled and late reads",()=>{
    const visits=new ArtworkVisits();
    const first=visits.start("first","fr",origin()),second=visits.start("second","fr",origin());
    expect(first.signal.aborted).toBe(true);expect(visits.complete(first.id,"/artworks/first")).toBeNull();
    expect(visits.complete(second.id,"/artworks/second")?.action).toBe("push");
    expect(visits.complete(second.id,"/artworks/second")).toBeNull();
    expect(visits.close("/artworks")).toEqual({action:"back",origin:origin()});
    expect(second.signal.aborted).toBe(true);
  });
  it("closes a pending error without back, and retry resolves before its single push",()=>{
    const visits=new ArtworkVisits(),request=visits.start("unknown","fr",origin());
    visits.fail(request.id);expect(visits.state.kind).toBe("pending-error");
    const retry=visits.retry()!;expect(visits.state.kind).toBe("resolving");
    expect(visits.complete(retry.id,"/artworks/current")?.action).toBe("push");
    const check=visits.validate();visits.fail(check.id);expect(visits.state.kind).toBe("route-error");
    const recheck=visits.retry()!;expect(visits.complete(recheck.id,"/artworks/current")?.action).toBe("none");
    const fresh=new ArtworkVisits(),pending=fresh.start("unknown","fr",origin());fresh.fail(pending.id);
    expect(fresh.close("/artworks")).toEqual({action:"dismiss"});
    expect(fresh.complete(pending.id,"/artworks/stale")).toBeNull();
  });
  it("retains every reachable origin after visual state eviction, including entry 33",()=>{
    const visits=new ArtworkVisits(),tokens:string[]=[];
    for(let n=0;n<33;n++){
      const request=visits.start("art-"+n,"fr",origin(n)),commit=visits.complete(request.id,"/artworks/art-"+n)!;
      tokens.push(commit.token);visits.rememberVisual(commit.token,{scrollTop:n});visits.close("/artworks");
    }
    expect(visits.visualCount).toBe(32);expect(visits.originCount).toBe(33);
    expect(visits.visual(tokens[0]!)).toBeUndefined();
    visits.resume(tokens[0]!,"art-0","en");expect(visits.close("/en/artworks")).toEqual({action:"back",origin:origin(0)});
  });
  it("language uses replace and retains its trusted origin; a reload trusts no history token",()=>{
    const visits=new ArtworkVisits(),request=visits.start("a","fr",origin()),commit=visits.complete(request.id,"/artworks/a")!;
    const language=visits.changeLocale("en");expect(visits.complete(language.id,"/en/artworks/a")?.action).toBe("replace");
    expect(visits.close("/en/artworks")).toEqual({action:"back",origin:origin()});
    const reloaded=new ArtworkVisits();reloaded.resume(commit.token,"a","en");
    expect(reloaded.close("/en/artworks")).toEqual({action:"replace",href:"/en/artworks"});
  });
});
