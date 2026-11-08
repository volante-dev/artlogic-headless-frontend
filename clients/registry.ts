import {FooterView,type FooterViewProps} from "../components/footer/FooterView";
import {FormView,type FormViewProps} from "../components/forms/FormView";
import{editorialBlockRegistry}from"../lib/editorial/immersive/registry";
import{assertEditorialRegistry,assertEditorialClientContract}from"../lib/editorial/immersive/conformance";
import{editorialClientContracts}from"./editorial-contracts";
import {ArtworkMasonryCatalog,type ArtworkMasonryCatalogProps} from "../components/artworks/ArtworkMasonryCatalog";
import {ArtworkMasonryCard,type ArtworkMasonryCardProps} from "../components/artworks/ArtworkMasonryCard";
import type {ComponentType} from "react";
import {ArticleCard,type ArticleCardProps} from "../components/editorial/ArticleCard";
import {ArticleReader,type ArticleReaderProps} from "../components/editorial/ArticleReader";
import {EditorialBlocks,type EditorialBlocksProps} from "../components/editorial/EditorialBlocks";
import {AuthorProfile,type AuthorProfileProps} from "../components/editorial/AuthorProfile";
import {DemoGalleryContactForm} from "./demo-gallery/ContactForm";
import {ContactFormView} from "../components/contact/ContactFormView";
import type {ContactFormViewProps} from "../lib/contact/types";
import {ArtworkCard,type ArtworkCardProps} from "../components/ArtworkCard";
import {DemoGalleryArtworkCard} from "./demo-gallery/ArtworkCard";
import {ArtworkCatalog,type ArtworkCatalogProps} from "../components/artworks/ArtworkCatalog";
import {ArtworkExperience,type ArtworkExperienceProps} from "../components/artworks/ArtworkExperience";
import {ArtworkInformation,type ArtworkInformationProps} from "../components/artworks/ArtworkInformation";
import {ArtworkProgress,type ArtworkProgressProps} from "../components/artworks/ArtworkProgress";
import {DemoGalleryArtworkExperience} from "./demo-gallery/ArtworkExperience";
export interface ClientComponents{Footer:ComponentType<FooterViewProps>;Form:ComponentType<FormViewProps>;EditorialBlockRegistry:typeof editorialBlockRegistry;ArtworkMasonryCatalog:ComponentType<ArtworkMasonryCatalogProps>;ArtworkMasonryCard:ComponentType<ArtworkMasonryCardProps>;ArticleCard:ComponentType<ArticleCardProps>;ArticleReader:ComponentType<ArticleReaderProps>;EditorialBlocks:ComponentType<EditorialBlocksProps>;AuthorProfile:ComponentType<AuthorProfileProps>;ContactForm:ComponentType<ContactFormViewProps>;ArtworkCard:ComponentType<ArtworkCardProps>;ArtworkCatalog:ComponentType<ArtworkCatalogProps>;ArtworkExperience:ComponentType<ArtworkExperienceProps>;ArtworkInformation:ComponentType<ArtworkInformationProps>;ArtworkProgress:ComponentType<ArtworkProgressProps>}
const generic:ClientComponents={Footer:FooterView,Form:FormView,EditorialBlockRegistry:editorialBlockRegistry,ArtworkMasonryCatalog,ArtworkMasonryCard,ArticleCard,ArticleReader,EditorialBlocks,AuthorProfile,ArtworkCard,ContactForm:ContactFormView,ArtworkCatalog,ArtworkExperience,ArtworkInformation,ArtworkProgress};
const profiles={default:{},"demo-gallery":{ArtworkCard:DemoGalleryArtworkCard,ContactForm:DemoGalleryContactForm,ArtworkExperience:DemoGalleryArtworkExperience}} satisfies Record<string,Partial<ClientComponents>>;
export type ClientProfile=keyof typeof profiles;
/** Finite imports only. The caller has already verified the server-selected manifest. */
export function resolveClientComponents(profileId:string):ClientComponents{
 if(!Object.hasOwn(profiles,profileId))throw new Error("unsupported_presentation_profile");
 if(!Object.hasOwn(editorialClientContracts,profileId))throw new Error("editorial_client_contract_missing");
 const overrides=profiles[profileId as ClientProfile];assertEditorialClientContract(overrides,editorialClientContracts[profileId as ClientProfile]);
 const result={...generic,...overrides};assertEditorialRegistry(result.EditorialBlockRegistry);return result;
}
