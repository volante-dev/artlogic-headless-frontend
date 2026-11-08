import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {describe,expect,it} from "vitest";
import {PageRenderer} from "../../page-composer/PageRenderer";
import {sectionDefinitions} from "../../page-composer/definitions";
import {assertRenderableSection,sectionRegistry} from "../../page-composer/registry";
import {SectionImage} from "../../sections/shared";
import {manifestFingerprints} from "../../clients/manifests/fingerprints.generated";
import projection from "../../clients/default/projection.json";
import type {PresentationSection,PublicPresentation,PresentationTheme,PresentationAsset} from "../../lib/presentation/types";
const id="11111111-1111-4111-8111-111111111111",art={id,title:"Public artwork",artist:"Artist",year:null,medium:null,dimensions:null,media:[]};
function presentation(sections:PresentationSection[],pageKey:PublicPresentation["pageKey"]="home"):PublicPresentation{return {releaseId:id,schemaVersion:1,profileId:"default",manifestFingerprint:manifestFingerprints.default,locale:"fr",pageKey,theme:projection as PresentationTheme,fontFiles:[],sections};}
describe("closed presentation rendering",()=>{
  it("renders every declared type and variant with the real reusable views",()=>{
    expect(Object.keys(sectionRegistry).sort()).toEqual(sectionDefinitions.map(d=>d.type).sort());
    for(const definition of sectionDefinitions)for(const variant of definition.variants){
      const section={id,type:definition.type,schemaVersion:1,variant,props:definition.type==="articleSelection"?{articles:[]}: {}} as PresentationSection;
      expect(()=>assertRenderableSection(section)).not.toThrow();
      const html=renderToStaticMarkup(createElement(PageRenderer,{presentation:presentation([section],definition.type==="artworkCatalog"?"artworks":definition.type==="artworkDetails"?"artworkDetail":"home"),siteName:"Gallery",data:{artwork:art,catalog:{kind:"legacy",page:{items:[art],catalogRevision:1,nextCursor:null,restarted:false}}}}));
      expect(html).toContain("<h1");expect(html).not.toContain("undefined");
    }
  });
  it("escapes editorial content, retains structured links and emits one page heading",()=>{
    const html=renderToStaticMarkup(createElement(PageRenderer,{presentation:presentation([{id,type:"text",schemaVersion:1,variant:"standard",props:{heading:"<script>alert(1)</script>",body:"<img onerror=alert(1)>",link:{kind:"email",value:"gallery@example.com"},linkLabel:"Contact"}},{id:id.replace("11111111","22222222"),type:"text",schemaVersion:1,variant:"narrow",props:{heading:"Second heading"}}],"contact"),siteName:"Gallery"}));
    expect(html).toContain("&lt;script&gt;");expect(html).not.toContain("<script>");expect(html).toContain('href="mailto:gallery@example.com"');expect(html.match(/<h1\b/g)).toHaveLength(1);expect(html).toContain("Second heading</h2>");
  });
  it("does not silently substitute unknown profiles, schemas or variants",()=>{
    const section={id,type:"text",schemaVersion:1,variant:"standard",props:{}} as PresentationSection;
    for(const change of [{type:"remote-code"},{schemaVersion:2},{variant:"unregistered"}])expect(()=>assertRenderableSection({...section,...change} as PresentationSection)).toThrow("unsupported_presentation_section");
    expect(()=>renderToStaticMarkup(createElement(PageRenderer,{presentation:{...presentation([section]),profileId:"unregistered"},siteName:"Gallery"}))).toThrow("unsupported_presentation_profile");
  });
  it("uses only actual private image variants and preserves alt and captions",()=>{
    const image:PresentationAsset={id,kind:"image",path:"/v1/public/presentation-assets/"+id+"?variant=w1280",mimeType:"image/webp",byteSize:500,width:1280,height:800,variants:[{variant:"w640",width:640,height:400,path:"/v1/public/presentation-assets/"+id+"?variant=w640"},{variant:"w1280",width:1280,height:800,path:"/v1/public/presentation-assets/"+id+"?variant=w1280"}]};
    const html=renderToStaticMarkup(createElement(SectionImage,{image,alt:"Sculpture",caption:"Private origin omitted"}));expect(html).toContain(" 640w");expect(html).toContain(" 1280w");expect(html).not.toContain("1920w");expect(html).not.toContain("_next/image");expect(html).not.toContain("/v1/public/");expect(html).toContain('alt="Sculpture"');expect(html).toContain("<figcaption");
  });
});
