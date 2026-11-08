import type {ComponentType} from "react";
import {Form} from "../sections/Form";
import {FormImage} from "../sections/FormImage";
import type {PresentationSection} from "../lib/presentation/types";
import type {SectionProps} from "../sections/types";
import {sectionDefinitions} from "./definitions";
import {HeroMedia} from "../sections/HeroMedia";
import {Text} from "../sections/Text";
import {TextImage} from "../sections/TextImage";
import {ArtworkSelection} from "../sections/ArtworkSelection";
import {ArticleSelection} from "../sections/ArticleSelection";
import {EditorialCards} from "../sections/EditorialCards";
import {ImageGallery} from "../sections/ImageGallery";
import {Contact} from "../sections/Contact";
import {ArtworkCatalog} from "../sections/ArtworkCatalog";
import {ArtworkDetailsSection} from "../sections/ArtworkDetailsSection";
export type SectionRegistry={[T in PresentationSection["type"]]:ComponentType<SectionProps<T>>};
export const sectionRegistry={form:Form,formImage:FormImage,heroMedia:HeroMedia,text:Text,textImage:TextImage,artworkSelection:ArtworkSelection,articleSelection:ArticleSelection,editorialCards:EditorialCards,imageGallery:ImageGallery,contact:Contact,artworkCatalog:ArtworkCatalog,artworkDetails:ArtworkDetailsSection} satisfies SectionRegistry;
export function assertRenderableSection(section:PresentationSection){
  const definition=sectionDefinitions.find(d=>d.type===section.type);
  if(!definition||section.schemaVersion!==definition.schemaVersion||!(definition.variants as readonly string[]).includes(section.variant)||!(section.type in sectionRegistry))throw new Error("unsupported_presentation_section");
}
