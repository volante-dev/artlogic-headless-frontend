import 'server-only';
import {storePublicRequest} from './catalog';
import type {components} from './contract-types.generated';
export type StoreLegalDocument=components['schemas']['CommerceLegalDocument'];
export function loadStoreLegalDocument(kind:StoreLegalDocument['kind'],locale:string,version?:string){return storePublicRequest<StoreLegalDocument>('/v1/public/store/documents/'+kind+'?'+new URLSearchParams({locale,...(version?{version}:{})}),'CommerceLegalDocument');}
