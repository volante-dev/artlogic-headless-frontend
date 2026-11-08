"use client";
import type {PublicArticle} from "../../lib/editorial/types";
import type {ArticleReaderProps} from "./ArticleReader";
import {useClientComponents} from "../../clients/ClientComponentsProvider";
import {useSiteLocale} from "../SiteLocaleBoundary";
export function PublicArticleDocument({article}:{article:PublicArticle}){
 const translated=useSiteLocale()?.translation?.article;
 return <EditorialArticleDocument article={translated?.id===article.id?translated:article}/>;
}
export function EditorialArticleDocument({article}:{article:ArticleReaderProps["article"]}){const components=useClientComponents(),View=components.ArticleReader;return <View article={article} blockRegistry={components.EditorialBlockRegistry} BlocksView={components.EditorialBlocks} AuthorView={components.AuthorProfile} CardView={components.ArticleCard}/>;}
