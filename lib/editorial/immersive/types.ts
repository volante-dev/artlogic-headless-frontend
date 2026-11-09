import type {ComponentType} from "react";
import type {components} from "../../api/generated";
export type PublicBlock=components["schemas"]["EditorialPublicBlock"];
export type EditorialBlockKind = "text" | "media" | "textMedia" | "carousel" | "imageGroup" | "form" | "formImage";
export type ReadingMode = "classic" | "immersive";
export type ReaderState = "classic" | "ready" | "preparing" | "transitioning";
/** Milliseconds, code-owned budgets; never persisted in an article. */
export interface MediaPreparationPolicy { readonly preparationBudgetMs:1500; readonly unavailableAfterMs:10000 }
export type ViewPhase = "inactive" | "entering" | "active" | "leaving";
export type Direction = -1 | 0 | 1;
export type ExecutionMode = "live" | "inert";
export type Panel = "text" | "media";
export type AnimationId =
 | "text-fade" | "text-rise" | "text-stagger"
 | "media-fade" | "media-zoom-out" | "media-reveal"
 | "split-fade" | "split-cross-reveal" | "split-stagger"
 | "carousel-fade" | "carousel-zoom-out" | "carousel-reveal"
 | "group-fade" | "group-reveal" | "group-zoom-out"
 | "form-fade" | "form-rise" | "form-reveal";
export interface ProjectedBlockIdentity { readonly id:string; readonly type:EditorialBlockKind }
export interface Viewport { readonly layout:"mobile"|"desktop"; readonly usefulHeight:number }
export interface View { readonly kind:"opening"|"block"|"related"; readonly id:string; readonly blockId?:string; readonly panel?:Panel; readonly animationId:AnimationId }
export interface ViewContext {
 readonly viewId:string; readonly blockId?:string; readonly panel?:Panel;
 readonly warming?:boolean; readonly preparing?:boolean; readonly active:boolean; readonly phase:ViewPhase; readonly direction:Direction;
 readonly reducedMotion:boolean; readonly executionMode:ExecutionMode;
 readonly suspended:boolean;
 registerScrollHost(element:HTMLElement|null):void;
 registerMotionTarget(role:"surface"|"content"|"media"|"text",element:HTMLElement|null):void;
 acquireSuspension(reason:"artwork"|"image"|"author"|"menu"|"fullscreen"|"hidden"):()=>void;
}
export interface MotionDescriptor {
 readonly id:AnimationId; readonly labelKey:string;
 readonly reducedMotion:"instant"; readonly status:"proposed"|"validated";
}
export interface EditorialBlockDefinition<B extends ProjectedBlockIdentity> {
 readonly type:B["type"]; readonly contractVersion:1;
 readonly animations:readonly [MotionDescriptor,MotionDescriptor,MotionDescriptor];
 readonly defaultAnimation:AnimationId;
 readonly overflow:"native-inner-scroll";
 readonly ClassicView:ComponentType<{block:B}>;
 readonly ImmersiveView:ComponentType<{block:B;context:ViewContext}>;
 createViews(block:B,viewport:Viewport):readonly View[];
}
export interface EditorialRenderCapabilities {
 readonly contractVersion:1;
 readonly profileId:string;
 readonly supportsClassic:true; readonly supportsImmersive:true;
 readonly blockKinds:readonly EditorialBlockKind[];
 readonly readerContractVersion:1; readonly blocksContractVersion:1;
}
export interface ViewProgressProps {
 readonly count:number; readonly active:number;
 readonly navigationLabel:string; readonly stepLabel:(index:number,total:number)=>string;
 readonly className?:string;
 onSelect(index:number):void;
}
