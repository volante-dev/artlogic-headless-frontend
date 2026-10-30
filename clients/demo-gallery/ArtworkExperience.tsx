"use client";
import {ArtworkExperience,type ArtworkExperienceProps} from "../../components/artworks/ArtworkExperience";
import {DemoGalleryMobileArtworkExperience} from "./MobileArtworkExperience";
import styles from "./ArtworkExperience.module.css";
/** Example client layer: the protected reader, modal and visit controller stay generic. */
export function DemoGalleryArtworkExperience({MobileView=DemoGalleryMobileArtworkExperience,...props}:ArtworkExperienceProps){return <div className={styles.demo} data-client="demo-gallery-experience"><ArtworkExperience {...props} MobileView={MobileView}/></div>;}
