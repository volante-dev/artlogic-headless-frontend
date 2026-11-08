"use client";
import type {SectionProps} from "./types";
import {useClientComponents} from "../clients/ClientComponentsProvider";
export function ArtworkCatalog({section,data}:SectionProps<"artworkCatalog">){
  const {ArtworkCatalog:Catalog,ArtworkCard,ArtworkMasonryCatalog,ArtworkMasonryCard}=useClientComponents();
  if(!data?.catalog)throw new Error("catalog_data_required");
  const catalog=data.catalog;
  if(catalog.kind!=="error"&&"layout" in catalog.page&&catalog.page.layout==="masonry")return <ArtworkMasonryCatalog id={section.id} catalog={catalog} columns={section.props.columns??3} CardView={ArtworkMasonryCard}/>;
  return <Catalog id={section.id} catalog={data.catalog} columns={section.props.columns??3} CardView={ArtworkCard}/>;
}
