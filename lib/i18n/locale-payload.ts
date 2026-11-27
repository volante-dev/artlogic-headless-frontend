import type {NavigationPublicProjection} from "../navigation/types";
import type {SiteMessages,RuntimeCatalogueContext} from "./site-messages";
import type {PublicPresentation} from "../presentation/types";
import type {GalleryExperience} from "../artworks/types";
import type {PublicArticle,ArticlePage,ArticleFilters} from "../editorial/types";
import type {EditorialQuery} from "../editorial/query";
import type {PublicLanguagePolicy} from './language-policy-protocol';
export interface LocalePayload {
 navigation:NavigationPublicProjection;locale:string;runtime?:RuntimeCatalogueContext;languagePolicy?:PublicLanguagePolicy;messages:SiteMessages;presentation:PublicPresentation;artwork:GalleryExperience|null;
 article?:PublicArticle|null;editorialPage?:ArticlePage|null;editorialFilters?:ArticleFilters|null;editorialQuery?:EditorialQuery|null;
}

/** HTTP shapes remain distinct from the validated in-memory artwork projection. */
export type LocalePayloadV0=Omit<LocalePayload,'artwork'>&{artwork:import('../api/generated').components['schemas']['GalleryExperience']|null};
export type LocalePayloadV1=Omit<LocalePayloadV0,'artwork'|'presentation'>&{artwork:(NonNullable<LocalePayloadV0['artwork']>&{artworkAddresses:import('../artworks/addresses').ArtworkAddressSet})|null;presentation:PublicPresentation&{artworkAddresses:import('../artworks/addresses').ArtworkAddressSet}};
