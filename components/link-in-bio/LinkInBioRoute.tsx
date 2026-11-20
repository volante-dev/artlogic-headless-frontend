import {randomUUID} from 'node:crypto';
import type {Schemas} from '@/lib/link-in-bio/contracts';
import {HeaderRouteCommit} from '../header/HeaderRouteCommit';
import {loadHeaderRouteContext} from '@/lib/header/load-route-context';
import {OriginFreshnessBeacon} from '../artworks/OriginFreshnessBeacon';
import {LinkInBioFeed} from './LinkInBioFeed';
export async function LinkInBioRoute({feed,cursor}:{feed:Schemas['LibPublicFeed'];cursor?:string|null}){
 return <><div data-native-link-in-bio><LinkInBioFeed key={[feed.siteId,feed.locale,feed.releaseId,feed.revision,cursor??'first'].join(':')} initial={feed} cursor={cursor}/><noscript><style>{`body:has([data-native-link-in-bio]){display:flex;flex-direction:column}body:has([data-native-link-in-bio]) div:has(footer),body:has([data-native-link-in-bio]) div[hidden]:has([data-native-link-in-bio]){display:contents!important}body:has([data-native-link-in-bio]) main:has([data-testid="catalog-loading"]){display:contents}body:has([data-native-link-in-bio]) [data-testid="catalog-loading"]{display:none}body:has([data-native-link-in-bio]) [data-native-link-in-bio]{order:1;width:100%}body:has([data-native-link-in-bio]) footer{order:2}body:has([data-native-link-in-bio]) [data-link-bio-continuation] button{display:none}`}</style></noscript></div><OriginFreshnessBeacon nonce={randomUUID()}/><HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;
}
