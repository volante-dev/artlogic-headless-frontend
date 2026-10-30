"use client";
import {useClientComponents} from "../clients/ClientComponentsProvider";
import type {SectionProps} from "./types";
import {ArtworkDetails} from "../components/ArtworkDetails";
import styles from "./Sections.module.css";
export function ArtworkDetailsSection({section,data}:SectionProps<"artworkDetails">){const {ArtworkExperience,ArtworkInformation,ArtworkProgress}=useClientComponents();if(data?.artworkContent)return <ArtworkExperience id={section.id} content={data.artworkContent} InformationView={ArtworkInformation} ProgressView={ArtworkProgress}/>;if(!data?.artwork)throw new Error("artwork_data_required");return <section id={section.id} className={styles.section}><ArtworkDetails art={data.artwork}/></section>;}
