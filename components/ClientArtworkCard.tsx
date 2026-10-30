"use client";
import type {ArtworkCardProps} from "./ArtworkCard";
import {useClientComponents} from "../clients/ClientComponentsProvider";
export function ClientArtworkCard(props:ArtworkCardProps){const {ArtworkCard}=useClientComponents();return <ArtworkCard {...props}/>;}
