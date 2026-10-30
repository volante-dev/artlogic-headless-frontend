import type {ComponentType} from "react";
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
export interface ClientComponents{ContactForm:ComponentType<ContactFormViewProps>;ArtworkCard:ComponentType<ArtworkCardProps>;ArtworkCatalog:ComponentType<ArtworkCatalogProps>;ArtworkExperience:ComponentType<ArtworkExperienceProps>;ArtworkInformation:ComponentType<ArtworkInformationProps>;ArtworkProgress:ComponentType<ArtworkProgressProps>}
const generic:ClientComponents={ArtworkCard,ContactForm:ContactFormView,ArtworkCatalog,ArtworkExperience,ArtworkInformation,ArtworkProgress};
const profiles={default:{},"demo-gallery":{ArtworkCard:DemoGalleryArtworkCard,ContactForm:DemoGalleryContactForm,ArtworkExperience:DemoGalleryArtworkExperience}} satisfies Record<string,Partial<ClientComponents>>;
export type ClientProfile=keyof typeof profiles;
/** Finite imports only. The caller has already verified the server-selected manifest. */
export function resolveClientComponents(profileId:string):ClientComponents{
 if(!Object.hasOwn(profiles,profileId))throw new Error("unsupported_presentation_profile");
 return {...generic,...profiles[profileId as ClientProfile]};
}
