import {Ajv2020} from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import {editorialPublicSchemas} from "./schemas.generated";
import type {PublicArticle,ArticlePage,ArticleResolution,ArticleFilters} from "./types";
const ajv=new Ajv2020({strict:true,coerceTypes:false,removeAdditional:false});(addFormats as unknown as (value:Ajv2020)=>void)(ajv);ajv.addKeyword({keyword:"example",valid:true});
const article=ajv.compile(editorialPublicSchemas.EditorialPublicArticle),resolution=ajv.compile(editorialPublicSchemas.EditorialArticleResolution),page=ajv.compile(editorialPublicSchemas.EditorialArticleCardPage),filters=ajv.compile(editorialPublicSchemas.EditorialPublicFilters);
export function parsePublicArticle(value:unknown):PublicArticle{if(!article(value))throw new Error("invalid_response");return value as PublicArticle;}
export function parseArticleResolution(value:unknown):ArticleResolution{if(!resolution(value))throw new Error("invalid_response");return value as ArticleResolution;}
export function parseArticlePage(value:unknown):ArticlePage{if(!page(value))throw new Error("invalid_response");return value as ArticlePage;}
export function parseArticleFilters(value:unknown):ArticleFilters{if(!filters(value))throw new Error("invalid_response");return value as ArticleFilters;}
