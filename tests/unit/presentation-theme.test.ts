import {describe,expect,it} from "vitest";
import {createSiteTheme,siteVariables,typographyStyle} from "../../branding/create-site-theme";
import {fontFaces,fontFamily} from "../../branding/font-faces";
import projection from "../../clients/default/projection.json";
import {builtinFonts} from "../../branding/font-catalog";
import type {PresentationTheme,PresentationAsset} from "../../lib/presentation/types";
const theme=()=>structuredClone(projection) as PresentationTheme;
describe("serializable presentation themes",()=>{
  it("keeps two site renders independent and includes all configured color/type roles",()=>{
    const first=theme(),second=theme();second.colors.background="#123456";second.typography.h1.weight=700;
    const a=createSiteTheme(first),b=createSiteTheme(second);expect(a.palette.background.default).toBe(first.colors.background);expect(b.palette.background.default).toBe("#123456");expect(a.typography.h1.fontWeight).toBe(400);expect(b.typography.h1.fontWeight).toBe(700);
    const css=siteVariables(second);for(const [role,color] of Object.entries(second.colors))expect(css).toContain(`--site-color-${role}:${color};`);
    for(const [role,value] of Object.entries(second.typography))for(const [property,setting] of Object.entries(typographyStyle(value)))expect(css).toContain(`--site-${role}-${property}:${setting};`);
  });
  it("loads only the used built-in faces from the exact local allowlist with swap",()=>{
    const current=theme(),css=fontFaces(current,[]),used=new Set(Object.values(current.typography).map(role=>`${role.familyId}:${role.weight}:${role.style}`));
    for(const family of builtinFonts)for(const face of family.faces)expect(css.includes(face.path)).toBe(used.has(`${family.id}:${face.weight}:${face.style}`));
    expect(css).toContain("font-display:swap");expect(css).not.toMatch(/https?:|@import/);
  });
  it("derives uploaded font names from identity and relays only the chosen face",()=>{
    const current=theme(),id="11111111-1111-4111-8111-111111111111",assetId="22222222-2222-4222-8222-222222222222";current.typography.h1.familyId=id;
    const font:PresentationAsset={id:assetId,kind:"font",path:"/v1/public/presentation-assets/"+assetId,mimeType:"font/woff2",byteSize:40,font:{familyId:id,weight:400,style:"normal"}};
    const css=fontFaces(current,[font]);expect(css).toContain('src:url("/presentation-assets/'+assetId+'")');expect(css).toContain('font-family:"site_font_'+id.replaceAll("-","")+'"');expect(css).not.toContain("/v1/public/");
    expect(fontFaces(current,[{...font,font:{familyId:id,weight:700,style:"normal"}}])).not.toContain(assetId);
    expect(()=>fontFaces(current,[{...font,path:"https://untrusted.invalid/font.woff2"}])).toThrow();
    const preview=fontFaces(current,[{...font,path:"/v1/preview/assets/"+assetId}],"preview");expect(preview).toContain('/preview/assets/'+assetId);expect(preview).not.toContain('/presentation-assets/');expect(fontFamily(id)).toContain(', sans-serif');
    expect(()=>fontFaces(current,[{...font,path:"/v1/preview/assets/"+assetId}])).toThrow();
  });
  it("does not accept arbitrary names or non-opaque CSS colors",()=>{
    expect(()=>fontFamily('anything";src:url(https://untrusted.invalid)')).toThrow();
    const current=theme();current.colors.background="transparent";expect(()=>siteVariables(current)).toThrow();
  });
});
