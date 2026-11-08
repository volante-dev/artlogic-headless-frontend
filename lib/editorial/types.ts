import type {components} from "../api/generated";
export type ArticleKind="publication"|"news"|"exhibition";
export type PublicArticle=components["schemas"]["EditorialPublicArticle"];
export type ArticleCardData=components["schemas"]["EditorialArticleCard"];
export type ArticlePage=components["schemas"]["EditorialArticleCardPage"];
export type ArticleFilters=components["schemas"]["EditorialPublicFilters"];
export type ArticleResolution=components["schemas"]["EditorialArticleResolution"];
