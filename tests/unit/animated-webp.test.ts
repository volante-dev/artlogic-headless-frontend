import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {expect,it} from "vitest";
import {AnimatedAssetImage} from "../../components/AnimatedAssetImage";
import {SiteLoaderProvider} from "../../components/SiteLoaderProvider";
import {LoadingIndicator,SiteLoading} from "../../components/SiteLoading";
import {Button} from "../../components/ui/Button";
import {IconButton} from "../../components/ui/IconButton";
import {HeroMedia} from "../../sections/HeroMedia";
import type {PresentationAsset} from "../../lib/presentation/types";
const id="11111111-1111-4111-8111-111111111111";
const asset:PresentationAsset={id,kind:"image",path:`/v1/public/presentation-assets/${id}?variant=original`,mimeType:"image/webp",byteSize:100,width:80,height:80,variants:[{variant:"w640",path:`/v1/public/presentation-assets/${id}?variant=w640`,width:80,height:80}]};
it("renders animated bytes directly with a static source for reduced motion",()=>{
 const html=renderToStaticMarkup(createElement(AnimatedAssetImage,{asset}));
 expect(html).toContain(`src="/presentation-assets/${id}?variant=original"`);expect(html).toContain('media="(prefers-reduced-motion: reduce)"');expect(html).toContain(`srcSet="/presentation-assets/${id}?variant=w640"`);expect(html).not.toContain("_next/image");
 expect(renderToStaticMarkup(createElement(AnimatedAssetImage,{asset,paused:true}))).not.toContain('src="/presentation-assets/'+id+'?variant=original"');
});
it("overrides only centered page loaders while retaining their accessible label",()=>{
 const html=renderToStaticMarkup(createElement(SiteLoaderProvider,{asset,scope:"public"},createElement(LoadingIndicator,{centered:true,label:"Chargement"})));expect(html).toContain('role="progressbar"');expect(html).toContain('aria-label="Chargement"');expect(html).toContain("<picture");
 for(const props of [{},{compact:true},{compact:true,centered:true}]){const inline=renderToStaticMarkup(createElement(SiteLoaderProvider,{asset,scope:"public"},createElement(LoadingIndicator,props)));expect(inline).not.toContain("<picture");expect(inline).toContain("track");}
 expect(renderToStaticMarkup(createElement(SiteLoaderProvider,{asset,scope:"public"},createElement(SiteLoading)))).toContain("<picture");
 const legacy=renderToStaticMarkup(createElement(LoadingIndicator));expect(legacy).not.toContain("<picture");expect(legacy).toContain("track");
});
it("keeps button and icon-button loading indicators unchanged with a contributed WebP",()=>{
 for(const Component of [Button,IconButton]){const html=renderToStaticMarkup(createElement(SiteLoaderProvider,{asset,scope:"public"},createElement(Component,{loading:true,"aria-label":"Envoi"})));expect(html).not.toContain("<picture");expect(html).toContain("track");}
});
it("renders the optional hero overlay as decorative media without removing content",()=>{
 const html=renderToStaticMarkup(createElement(HeroMedia,{section:{id,type:"heroMedia",schemaVersion:1,variant:"immersive",props:{overlay:{...asset,path:asset.variants![0].path},heading:"Galerie",linkLabel:"Découvrir"}}}));
 expect(html).toContain("overlay");expect(html).toContain('alt=""');expect(html).toContain("Galerie");expect(html).toContain("Découvrir");
});
it("does not briefly render the looping original before preparing the single-pass hero",()=>{
 const html=renderToStaticMarkup(createElement(HeroMedia,{section:{id,type:"heroMedia",schemaVersion:1,variant:"immersive",props:{overlay:asset,heading:"Galerie"}}}));expect(html).not.toContain("<picture");expect(html).not.toContain("variant=original");expect(html).toContain("Galerie");
});
