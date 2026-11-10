import type {GalleryExperience} from './types';
import type {SiteMessages} from '../i18n/messages.generated';
export type ArtworkDocumentSnapshot=Pick<GalleryExperience,'artwork'|'locale'|'description'|'descriptionLocale'|'heroFocus'|'importedDescription'|'importedDescriptionLocale'|'importedProvenance'|'importedProvenanceLocale'>;
/** Only the already-filtered public projection enters this view model. */
export function artworkDocumentContent(content:ArtworkDocumentSnapshot){
 return {title:content.artwork.title,artist:content.artwork.artist,details:([['artwork.year',content.artwork.year],['artwork.medium',content.artwork.medium],['artwork.dimensions',content.artwork.dimensions]] as [keyof SiteMessages,string|null][]).filter((row):row is [keyof SiteMessages,string]=>row[1]!==null),description:content.importedDescription,descriptionLocale:content.importedDescriptionLocale??content.locale,provenance:content.importedProvenance,provenanceLocale:content.importedProvenanceLocale??content.locale};
}
