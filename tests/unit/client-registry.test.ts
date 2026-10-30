import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {expect,it} from "vitest";
import {resolveClientComponents} from "../../clients/registry";
import {ArtworkCard} from "../../components/ArtworkCard";
import {DemoGalleryArtworkCard} from "../../clients/demo-gallery/ArtworkCard";
import {SiteContentProvider} from "../../components/SiteContentProvider";
import {initialMessages} from "../../lib/i18n/messages.generated";
const art={id:"11111111-1111-4111-8111-111111111111",title:null,artist:null,year:"2026",medium:"Bronze",dimensions:null,media:[]};
it("resolves an explicit client replacement and otherwise retains the generic component",()=>{
 expect(resolveClientComponents("default").ArtworkCard).toBe(ArtworkCard);expect(resolveClientComponents("demo-gallery").ArtworkCard).toBe(DemoGalleryArtworkCard);expect(()=>resolveClientComponents("../../remote")).toThrow();
 // React.createElement type-checks this provider’s required children in its props object.
 // eslint-disable-next-line react/no-children-prop
 for(const profile of ["default","demo-gallery"])for(const locale of ["fr","en"]){const View=resolveClientComponents(profile).ArtworkCard;const html=renderToStaticMarkup(createElement(SiteContentProvider,{messages:initialMessages(locale),locale,defaultLocale:"fr",children:createElement(View,{art})}));expect(html).toContain(initialMessages(locale)["artwork.untitled"]);expect(html).toContain("/artworks/"+art.id);expect(html).toContain("<li");expect(html).not.toContain("undefined");expect(html.includes('data-client="demo-gallery"')).toBe(profile==="demo-gallery");}
});

it("keeps Contact authorization in the controller while allowing a typed client view",()=>{expect(resolveClientComponents("demo-gallery").ContactForm).not.toBe(resolveClientComponents("default").ContactForm);});
