import type {PresentationSection} from "../lib/presentation/types";
import type {Artwork,ArtworkPage} from "../lib/api/artworks";
import type {GalleryCatalog} from "../lib/artworks/types";
export type CatalogData=
  |{kind:"numbered";page:GalleryCatalog}
  |{kind:"legacy";page:ArtworkPage&{restarted:boolean}}
  |{kind:"error";code:"invalid_request"|"page_out_of_range"|"catalog_changed"|"rate_limited"|"service_unavailable";q:string;pageSize:number};
export interface PageData {catalog?:CatalogData;artwork?:Artwork;artworkContent?:import("../components/artworks/ArtworkInformation").ArtworkContent}
export interface SectionContext {contactMode?:import("../lib/contact/types").ContactExecutionMode;headingLevel?:"h1"|"h2";siteName?:string;demonstration?:boolean;exploreTarget?:string;data?:PageData}
export type SectionProps<T extends PresentationSection["type"]>={section:Extract<PresentationSection,{type:T}>}&SectionContext;
