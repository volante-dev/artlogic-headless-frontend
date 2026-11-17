import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {expect,it} from "vitest";
import {AnimatedAssetImage} from "../../components/AnimatedAssetImage";
import {SiteLoaderProvider} from "../../components/SiteLoaderProvider";
import {LoadingIndicator} from "../../components/SiteLoading";
import {HeroMedia} from "../../sections/HeroMedia";
import type {PresentationAsset} from "../../lib/presentation/types";
const id="11111111-1111-4111-8111-111111111111";
const asset:PresentationAsset={id,kind:"image",path:`/v1/public/presentation-assets/${id}?variant=original`,mimeType:"image/webp",byteSize:100,width:80,height:80,variants:[{variant:"w640",path:`/v1/public/presentation-assets/${id}?variant=w640`,width:80,height:80}]};
it("renders animated bytes directly with a static source for reduced motion",()=>{
 const html=renderToStaticMarkup(createElement(AnimatedAssetImage,{asset}));
 expect(html).toContain(`src="/presentation-assets/${id}?variant=original"`);expect(html).toContain('media="(prefers-reduced-motion: reduce)"');expect(html).toContain(`srcSet="/presentation-assets/${id}?variant=w640"`);expect(html).not.toContain("_next/image");
 expect(renderToStaticMarkup(createElement(AnimatedAssetImage,{asset,paused:true}))).not.toContain('src="/presentation-assets/'+id+'?variant=original"');
});
it("overrides shared loaders, including compact ones, while retaining their accessible label",()=>{
 for(const compact of [true,false]){const html=renderToStaticMarkup(createElement(SiteLoaderProvider,{asset,scope:"public"},createElement(LoadingIndicator,{compact,label:"Envoi"})));expect(html).toContain('role="progressbar"');expect(html).toContain('aria-label="Envoi"');expect(html).toContain("<picture");}
 const legacy=renderToStaticMarkup(createElement(LoadingIndicator));expect(legacy).not.toContain("<picture");expect(legacy).toContain("track");
});
it("renders the optional hero overlay as decorative media without removing content",()=>{
 const html=renderToStaticMarkup(createElement(HeroMedia,{section:{id,type:"heroMedia",schemaVersion:1,variant:"immersive",props:{overlay:asset,heading:"Galerie",linkLabel:"Découvrir"}}}));
 expect(html).toContain("overlay");expect(html).toContain('alt=""');expect(html).toContain("Galerie");expect(html).toContain("Découvrir");
});
