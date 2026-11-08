import {classifyRoute,preservedQuery,type RoutingPolicy} from '../i18n/routes';
import type {PublicPresentation} from '../presentation/types';
import type {NavigationPublicProjection} from '../navigation/types';
import type {Section} from '../i18n/routes';
import type {loadSiteContent} from '../i18n/load-site-content';
export const HEADER_HISTORY_KEY='__siteHeaderNavigation';
export interface HeaderDestination {href:string;kind:'home'|'menu'|'same-document'|'external';scope:'public'|'preview';pageKey?:string}
export interface HeaderRouteSnapshot {
 version:1;requestId:string;hrefKey:string;scope:'public';locale:string;pageKey:string;section:Section|null;
 site:Awaited<ReturnType<typeof loadSiteContent>>;presentation?:PublicPresentation;navigation?:NavigationPublicProjection;
 pageIdentity?:PublicPresentation['pageIdentity'];article?:{id:string;alternatePaths:Record<string,string>};immersive:boolean;
 status:'ready'|'not-found'|'unavailable';
}
export interface HeaderHistoryEntry {version:1;entryId:string;hrefKey:string;lastRequestId?:string}
export interface HeaderNavigationIntent {generation:number;entryId:string;target:string;source:'header'|'history';baselineRequestId?:string;refreshRequested:boolean;deadline:number}
export interface HeaderNavigationState {status:'ready'|'navigating'|'refreshing'|'error';generation:number;intent:HeaderNavigationIntent|null;snapshot:HeaderRouteSnapshot}
export function hrefKey(href:string,base:string){const url=new URL(href,base);return url.pathname+url.search;}
export function navigationHrefKey(href:string,base:string,policy:RoutingPolicy){const url=new URL(href,base);return url.pathname+preservedQuery(classifyRoute(url.pathname,policy),url.searchParams);}
export function destination(href:string,base:string,scope:'public'|'preview'='public'):HeaderDestination|null {
 if(href.startsWith('//'))return null;
 let url:URL;try{url=new URL(href,base);}catch{return null;}
 if(!['http:','https:'].includes(url.protocol))return null;
 const current=new URL(base);
 if(url.origin!==current.origin)return {href:url.href,kind:'external',scope};
 return {href:url.pathname+url.search+url.hash,scope,kind:hrefKey(url.href,base)===hrefKey(base,base)?'same-document':url.pathname==='/'?'home':'menu'};
}
export function readHistory(state:unknown):HeaderHistoryEntry|null {
 if(!state||typeof state!=='object')return null;
 const value=(state as Record<string,unknown>)[HEADER_HISTORY_KEY] as HeaderHistoryEntry|undefined;
 return value?.version===1&&typeof value.entryId==='string'&&typeof value.hrefKey==='string'&&value.hrefKey.startsWith('/')&&(!value.lastRequestId||typeof value.lastRequestId==='string')?value:null;
}
export function commitDecision(intent:HeaderNavigationIntent,proof:Pick<HeaderRouteSnapshot,'hrefKey'|'requestId'>,activeHref:string,generation:number,seen:ReadonlySet<string>){
 if(generation!==intent.generation||proof.hrefKey!==activeHref||activeHref!==intent.target)return 'ignore';
 return intent.source==='history'&&!intent.baselineRequestId&&!intent.refreshRequested||proof.requestId===intent.baselineRequestId||seen.has(proof.requestId)?'refresh':'accept';
}
export function requestRefresh(intent:HeaderNavigationIntent):HeaderNavigationIntent|null{return intent.refreshRequested?null:{...intent,refreshRequested:true};}
export function historyDecision(state:unknown,activeHref:string,activeEntryId:string|null):{kind:'ignore'}|{kind:'fresh'}|{kind:'restore';entry:HeaderHistoryEntry}{
 if(!state||typeof state!=='object'||!(HEADER_HISTORY_KEY in state))return {kind:'ignore'};
 const entry=readHistory(state);
 if(!entry||entry.hrefKey!==activeHref)return {kind:'fresh'};
 return entry.entryId===activeEntryId?{kind:'ignore'}:{kind:'restore',entry};
}
