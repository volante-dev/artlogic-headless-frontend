import type {NavigationPublicProjection} from "../navigation/types";
import type {SiteMessages} from "./messages.generated";
import type {PublicPresentation} from "../presentation/types";
import type {GalleryExperience} from "../artworks/types";
import type {PublicArticle,ArticlePage,ArticleFilters} from "../editorial/types";
import type {EditorialQuery} from "../editorial/query";
export interface LocalePayload {
 navigation:NavigationPublicProjection;locale:string;messages:SiteMessages;presentation:PublicPresentation;artwork:GalleryExperience|null;
 article?:PublicArticle|null;editorialPage?:ArticlePage|null;editorialFilters?:ArticleFilters|null;editorialQuery?:EditorialQuery|null;
}
