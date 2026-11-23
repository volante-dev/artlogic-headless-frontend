import type {components} from "../api/generated";
export type TeamSection=components["schemas"]["OurTeamSection"];
export type TeamPerson=components["schemas"]["OurTeamPublicPerson"];
export type TeamPublicProjection=components["schemas"]["OurTeamPublicProjection"];
export type TeamPreviewProjection=components["schemas"]["OurTeamPreviewProjection"];
export type TeamExtension=TeamPublicProjection|TeamPreviewProjection;
