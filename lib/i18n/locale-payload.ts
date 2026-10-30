import type {SiteMessages} from "./messages.generated";
import type {PublicPresentation} from "../presentation/types";
import type {GalleryExperience} from "../artworks/types";
export interface LocalePayload {
 locale:string;messages:SiteMessages;presentation:PublicPresentation;artwork:GalleryExperience|null;
}
