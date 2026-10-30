import {describe,it,expect} from "vitest";
import {parseCatalogQuery,preservedCatalogQuery,catalogQueryString} from "../../lib/artworks/catalog-query";
describe("public catalogue URL",()=>{
  it("normalizes a global search and preserves the complete numbered query across languages",()=>{
    expect(parseCatalogQuery({q:"  E\u0301tude ",page:"3",pageSize:"20",catalogRevision:"7"})).toEqual({kind:"numbered",query:{q:"Étude",page:3,pageSize:20,catalogRevision:7}});
    expect(preservedCatalogQuery(new URLSearchParams("q=E%CC%81tude&page=3&pageSize=20&catalogRevision=7"))).toBe("?q=%C3%89tude&page=3&pageSize=20&catalogRevision=7");
    expect(catalogQueryString({q:"100%_",page:1})).toBe("?q=100%25_&page=1");
  });
  it("keeps legacy cursors exclusive and rejects ambiguous or unbounded input",()=>{
    expect(parseCatalogQuery({cursor:"abc"})).toEqual({kind:"legacy",cursor:"abc"});
    for(const params of [{cursor:"abc",q:"x"},{q:["a","b"]},{page:"0"},{page:"01"},{page:"1e2"},{pageSize:"101"},{catalogRevision:"-1"},{q:"a".repeat(161)},{returnTo:"/private"}])expect(()=>parseCatalogQuery(params)).toThrow();
    expect(preservedCatalogQuery(new URLSearchParams("q=a&q=b"))).toBe("");
  });
});
