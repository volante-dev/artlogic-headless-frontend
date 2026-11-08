import type {PublicPresentation} from "./types";
export function selectPresentation<T extends Omit<PublicPresentation,"releaseId">>(initial:T,translated:PublicPresentation|null|undefined):T|PublicPresentation{
 if(translated?.profileId===initial.profileId&&translated.pageKey===initial.pageKey&&(translated.releaseId===(initial as Omit<PublicPresentation,"releaseId">&{releaseId?:string}).releaseId||initial.pageKey==="galerist"&&Boolean(translated.pageIdentity)))return translated;
 return initial;
}
