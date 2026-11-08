import {expect,it} from "vitest";
import {classifyRoute,isTechnicalPath,preservedQuery} from "../../lib/i18n/routes";
import {parseEditorialQuery} from "../../lib/editorial/query";
const policy={defaultLocale:"fr",locales:[{code:"fr",label:"Français"},{code:"en",label:"English"}]};
it("distinguishes articles from PageKeys, leaves address as an ordinary slug and rejects preparatory locale paths",()=>{
 expect(classifyRoute("/publications/address",policy)).toMatchObject({kind:"article",section:"publications",articleKind:"publication",articleSlug:"address",locale:"fr"});
 expect(classifyRoute("/en/news/address",policy)).toMatchObject({kind:"article",articleKind:"news",articleSlug:"address",locale:"en"});expect(classifyRoute("/publications/objet%20sculpt%C3%A9",policy)).toMatchObject({articleSlug:"objet sculpté"});expect(classifyRoute("/de/news/address",policy).kind).toBe("unknown");
 expect(classifyRoute("/en/exhibitions/test",policy)).toMatchObject({kind:"article",articleKind:"exhibition",articleSlug:"test",locale:"en"});
 expect(isTechnicalPath("/editorial-assets/00000000-0000-4000-8000-000000000001")).toBe(true);expect(isTechnicalPath("/api/editorial/articles")).toBe(true);expect(isTechnicalPath("/api/editorial/arbitrary")).toBe(false);
});
it("keeps only documented list criteria and treats the opaque decimal revision as a string",()=>{
 expect(parseEditorialQuery(new URLSearchParams("q=bois&page=2&pageSize=24&catalogRevision=79228162514264337593543950336"))).toMatchObject({q:"bois",page:2,pageSize:24,catalogRevision:"79228162514264337593543950336"});
 expect(()=>parseEditorialQuery(new URLSearchParams("page=2&page=3"))).toThrow();expect(()=>parseEditorialQuery(new URLSearchParams("siteId=foreign"))).toThrow();expect(()=>parseEditorialQuery(new URLSearchParams("pageSize=49"))).toThrow();
 const route=classifyRoute("/publications",policy);expect(preservedQuery(route,new URLSearchParams("q=bois&page=3&catalogRevision=7"))).toBe("?q=bois&page=3&catalogRevision=7");
});
