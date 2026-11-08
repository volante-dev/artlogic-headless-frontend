import {it,expect} from "vitest";
import {validateNavigation} from "../../lib/navigation/validate";
const id="11111111-1111-4111-8111-111111111111",policy={defaultLocale:"fr",locales:[{code:"fr",label:"Français"},{code:"en",label:"English"}]},expected={scope:"public" as const,locale:"fr",id,policy};
const base={schemaVersion:1,scope:"public",revision:"1",releaseId:id,locale:"fr",items:[{pageKey:"news",href:"/news"}]};
it("validates an ordered public menu and distinguishes empty success",()=>{expect(validateNavigation(base,expected)).toEqual(base);expect(validateNavigation({...base,items:[]},expected).items).toEqual([]);});
it.each(["https://example.com/news","//example.com/news","/artworks","/preview/render/fr/news","/%6eews","/news?secret=x"])("rejects mismatched or unsafe destinations %s",href=>{expect(()=>validateNavigation({...base,items:[{pageKey:"news",href}]},expected)).toThrow();});
it("rejects scope, release, locale, duplicate and size violations",()=>{for(const value of [{...base,scope:"preview"},{...base,locale:"en"},{...base,releaseId:"22222222-2222-4222-8222-222222222222"},{...base,items:[...base.items,...base.items]},{...base,unknown:"x".repeat(8192)}])expect(()=>validateNavigation(value,expected)).toThrow();});
