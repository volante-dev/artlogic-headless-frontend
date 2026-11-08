import {validGaleristSlug,isReservedGaleristSlug} from "../presentation/galerist-slug.generated";
import {Ajv2020} from "ajv/dist/2020.js";
import addFormatsModule from "ajv-formats";
import {navigationSchemas} from "./schemas.generated";
import {localizedPath,sections,type RoutingPolicy} from "../i18n/routes";
import type {NavigationPublicProjection,NavigationPreviewProjection} from "./types";
const ajv=new Ajv2020({strict:true,coerceTypes:false,removeAdditional:false});
(addFormatsModule as unknown as(a:Ajv2020)=>void)(ajv);ajv.addKeyword({keyword:"example",valid:true});
const publicSchema=ajv.compile(navigationSchemas.NavigationPublicProjection),previewSchema=ajv.compile(navigationSchemas.NavigationPreviewProjection);
export function validateNavigation(value:unknown,expected:{scope:"public"|"preview";locale:string;id:string;policy:RoutingPolicy}):NavigationPublicProjection|NavigationPreviewProjection{
 if(new TextEncoder().encode(JSON.stringify(value)).length>8192||!(expected.scope==="public"?publicSchema:previewSchema)(value))throw new Error("invalid_navigation_response");
 const nav=value as NavigationPublicProjection|NavigationPreviewProjection;
 if(nav.scope!==expected.scope||nav.locale!==expected.locale||(nav.scope==="public"?nav.releaseId:nav.snapshotId)!==expected.id||!expected.policy.locales.some(l=>l.code===nav.locale))throw new Error("invalid_navigation_context");
 const revision=nav.scope==="public"?nav.revision:nav.sourceRevision;if(revision!==null&&BigInt(revision)>BigInt("9223372036854775807"))throw new Error("invalid_navigation_revision");
 for(const link of nav.items){
  if(link.href.includes("\\")||/[?#\u0000-\u0020\u007f]/.test(link.href)||link.href.startsWith("//"))throw new Error("invalid_navigation_path");
  if(nav.scope==="preview"){if(link.href!=="/preview/render/"+nav.locale+"/"+link.pageKey)throw new Error("invalid_navigation_path");}
  else if(link.pageKey!=="galerist"){if(!sections.includes(link.pageKey)||link.href!==localizedPath("/"+link.pageKey,nav.locale,expected.policy.defaultLocale))throw new Error("invalid_navigation_path");}
  else {const prefix=nav.locale===expected.policy.defaultLocale?"/":"/"+nav.locale+"/",segment=link.href.slice(prefix.length);if(!link.href.startsWith(prefix)||!segment||segment.includes("/")||[".",".."].includes(segment)||/%(?:2f|5c|2e|00)/i.test(segment)||!validGaleristSlug(decodeURIComponent(segment))||isReservedGaleristSlug(decodeURIComponent(segment),expected.policy.locales.map(l=>l.code))||!link.name||Array.from(link.name).length>120)throw new Error("invalid_navigation_path");}
 }
 return nav;
}
