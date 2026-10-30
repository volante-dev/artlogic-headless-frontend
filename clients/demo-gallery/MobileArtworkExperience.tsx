"use client";
import {MobileArtworkExperience} from "../../components/artworks/MobileArtworkExperience";
import type {MobileArtworkViewProps} from "../../components/artworks/ArtworkMobileController";
/** Client layer delegates interaction, availability and translated content to the generic controller. */
export function DemoGalleryMobileArtworkExperience(props:MobileArtworkViewProps){return <div data-client-mobile="demo-gallery"><MobileArtworkExperience {...props}/></div>;}
