import type {ComponentType} from "react";
import {sectionRegistry} from "../page-composer/registry";
import {useSiteContent} from "../components/SiteContentProvider";
import {sectionFixture,type FixtureState,type SectionType} from "./section-fixtures";
import type {PresentationSection} from "../lib/presentation/types";
import type {SectionContext} from "../sections/types";
export function SectionStory({type,variant,state="normal"}:{type:SectionType;variant:string;state?:FixtureState}){
  const {locale}=useSiteContent(),fixture=sectionFixture(type,variant,state,locale);
  const View=sectionRegistry[type] as ComponentType<{section:PresentationSection}&SectionContext>;
  return <main id="contenu" data-page-key="home"><View {...fixture} siteName="Galerie de démonstration" demonstration headingLevel="h1"/></main>;
}
