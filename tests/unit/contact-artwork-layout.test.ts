import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {expect,it,vi} from "vitest";
import {useFormOwner} from "../../lib/forms/execution";
vi.mock("../../sections/Form",()=>({Form:()=>createElement("div",{"data-ordinary-form":true}),PublicForm:({formId,blockId,hideTitle}:{formId:string;blockId:string;hideTitle:boolean})=>createElement("div",{"data-existing-form":formId,"data-block":blockId,"data-hide-title":String(hideTitle),"data-artwork-owner":useFormOwner()?.artworkId})}));
import {PageRenderer} from "../../page-composer/PageRenderer";
import {MediaDisplayProvider} from "../../lib/media/MediaDisplayProvider";
import {ContactArtworkCard} from "../../components/contact/ContactArtworkSection";
import {contactArtworkFromExperience,isContactArtworkId} from "../../lib/contact/artwork";
import {manifestFingerprints} from "../../clients/manifests/fingerprints.generated";
import projection from "../../clients/default/projection.json";
import {sectionDefinitions} from "../../page-composer/definitions";
import type {PublicPresentation,PresentationSection} from "../../lib/presentation/types";
import type {GalleryExperience} from "../../lib/artworks/types";
const id="11111111-1111-4111-8111-111111111111",formId="22222222-2222-4222-8222-222222222222",blockId="33333333-3333-4333-8333-333333333333";
const experience={scope:"public",locale:"fr",artwork:{id,slug:"synthetic",title:"Œuvre publique",artist:"Mali",year:null,medium:"Bois",dimensions:"30 cm",media:[{id:formId,width:800,height:1200,alt:"Sculpture",path:"/v1/public/media/"+formId}]},heroFocus:{mediaId:formId,x:.4,y:.2},description:null,descriptionLocale:null,presentationReleaseId:id,catalogRevision:1} as GalleryExperience;
const artwork=contactArtworkFromExperience(experience,"Sans titre","fr");
function presentation(section:PresentationSection):PublicPresentation{return {releaseId:id,schemaVersion:1,profileId:"default",manifestFingerprint:manifestFingerprints.default,locale:"fr",pageKey:"contact",theme:projection as PublicPresentation["theme"],fontFiles:[],sections:[section]};}
it("projects only public summary fields, preserves hidden year and uses a same-origin media reference",()=>{
 expect(artwork).toMatchObject({id,title:"Œuvre publique",year:null,photo:{id:formId},focalPoint:{x:.4,y:.2},url:"/artworks/"+id});
 const html=renderToStaticMarkup(createElement(ContactArtworkCard,{artwork}));expect(html).toMatch(new RegExp('src="/media/'+formId+'\\?displayId=[A-Za-z0-9_%:.\\-]+"'));expect(html).not.toContain('X-Amz-');expect(html).toContain('object-position:40% 20%');expect(html).not.toContain("Année");expect(html).not.toContain("storageObjectKey");
 expect(contactArtworkFromExperience({...experience,locale:"en"},"Untitled","fr").url).toBe("/en/artworks/"+id);
 for(const value of [null,"https://evil.test/image","not-an-id",id+"?x=1"])expect(isContactArtworkId(value)).toBe(false);expect(isContactArtworkId(id)).toBe(true);
});
it.each(["form","formImage"] as const)("renders the existing %s placement once with its original form, block, title policy and artwork context",type=>{
 const section={id:blockId,type,schemaVersion:1,variant:sectionDefinitions.find(d=>d.type===type)!.variants[0],props:{formId,hideTitle:true}} as PresentationSection;
 const html=renderToStaticMarkup(createElement(PageRenderer,{presentation:presentation(section),siteName:"Gallery",includeContactForm:false,includePageTitle:false,contactStrategy:"forms",formArtworkId:id,data:{contactArtwork:artwork}}));
 expect(html.match(/data-contact-artwork-section/g)).toHaveLength(1);expect(html.match(/data-existing-form=/g)).toHaveLength(1);expect(html).toContain('data-existing-form="'+formId+'"');expect(html).toContain('data-block="'+blockId+'"');expect(html).toContain('data-hide-title="true"');expect(html).toContain('data-artwork-owner="'+id+'"');
});
it("leaves general contact unchanged and does not mount a form for an ambiguous placement",()=>{
 const section={id:blockId,type:"form",schemaVersion:1,variant:sectionDefinitions.find(d=>d.type==="form")!.variants[0],props:{formId}} as PresentationSection,p=presentation(section);
 const general=renderToStaticMarkup(createElement(PageRenderer,{presentation:p,siteName:"Gallery",includeContactForm:false,contactStrategy:"forms"}));expect(general).toContain("data-ordinary-form");expect(general).not.toContain("data-contact-artwork-section");
 const ambiguous=renderToStaticMarkup(createElement(PageRenderer,{presentation:{...p,sections:[section,{...section,id}]},siteName:"Gallery",includeContactForm:false,contactStrategy:"forms",data:{contactArtwork:artwork}}));expect(ambiguous).not.toContain("data-existing-form");expect(ambiguous).toContain('role="alert"');
});
it("renders a localized placeholder and escapes missing media and untrusted source text",()=>{
 const html=renderToStaticMarkup(createElement(ContactArtworkCard,{artwork:{id,title:"<img src=x onerror=alert(1)>",url:"/artworks/"+id,photo:null}}));expect(html).toContain("Image non disponible");expect(html).toContain("&lt;img");expect(html).not.toContain("<img src=x");
});

it("uses the shared responsive contact image without losing its focal point or alternative",()=>{
 const html=renderToStaticMarkup(createElement(MediaDisplayProvider,{responsive:true,children:createElement(ContactArtworkCard,{artwork})}));
 expect(html).toContain('image=r1-');expect(html).toContain('srcSet=');expect(html).toContain('object-position:40% 20%');expect(html).toContain('alt="Sculpture"');expect(html).not.toContain('/_next/image');expect(html).not.toContain('token=');
});
