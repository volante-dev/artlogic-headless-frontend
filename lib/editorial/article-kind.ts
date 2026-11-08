import type{ArticleKind}from"./types";
export const articleKindDescriptors={publication:{section:"publications",titleKey:"page.publications.title"},news:{section:"news",titleKey:"page.news.title"},exhibition:{section:"exhibitions",titleKey:"page.exhibitions.title"}}as const satisfies Record<ArticleKind,{section:string;titleKey:string}>;
export const sectionArticleKinds={publications:"publication",news:"news",exhibitions:"exhibition"}as const;
export type EditorialSection=keyof typeof sectionArticleKinds;
export function isEditorialSection(value:string):value is EditorialSection{return Object.hasOwn(sectionArticleKinds,value);}
export function kindForSection(value:string):ArticleKind|undefined{return isEditorialSection(value)?sectionArticleKinds[value]:undefined;}
