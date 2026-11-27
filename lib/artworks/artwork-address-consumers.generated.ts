// Generated from feature039 contracts. Do not edit; independent of legacy fingerprints.
import type {components} from './artwork-address-probe-contract.generated';
export type ArtworkProbeRequest=components['schemas']['ProbeRequest'];
export interface ArtworkProbeKey {siteId:string;consumerId:string;kid:string;key:string}
export interface ArtworkAddressConsumer {consumerId:string;role:'api'|'frontend';origin:string;buildId:string;deploymentId:string;projectId:string;rollback:boolean}
export const artworkProbeChecks=['uuidResolved','legacyResolved','preparedResolved','localeRespected','v0Compatible','publicPreparedHidden'] as const;
export type ArtworkProbeResults=Record<typeof artworkProbeChecks[number],boolean>;
export interface ArtworkProbeAttestation extends ArtworkProbeResults {iss:string;aud:string;scope:string;jti:string;nonce:string;siteId:string;operationId:string;consumerId:string;requestDigest:string;reportDigest:string;consumerInventoryRevision:string;contextRevision:string;observedBuildId:string;checkedAt:number;iat:number;exp:number}
