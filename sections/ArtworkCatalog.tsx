"use client";
import type {SectionProps} from "./types";
import {useClientComponents} from "../clients/ClientComponentsProvider";
export function ArtworkCatalog({section,data}:SectionProps<"artworkCatalog">){
  const {ArtworkCatalog:Catalog,ArtworkCard}=useClientComponents();
  if(!data?.catalog)throw new Error("catalog_data_required");
  return <Catalog id={section.id} catalog={data.catalog} columns={section.props.columns??3} CardView={ArtworkCard}/>;
}
