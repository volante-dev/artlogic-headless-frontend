import {notFound} from 'next/navigation';
import {PublicApiError} from '@/lib/api/client';
import {loadSiteContent} from '@/lib/i18n/load-site-content';
import {loadStoreLegalDocument,type StoreLegalDocument} from '@/lib/commerce/legal';
import {HeaderRouteCommit} from '@/components/header/HeaderRouteCommit';
import {loadHeaderRouteContext} from '@/lib/header/load-route-context';
import {LegalDocument} from './LegalDocument';
export async function LegalDocumentPage({kind,version}:{kind:StoreLegalDocument['kind'];version?:string}){const site=await loadSiteContent();let document:StoreLegalDocument;try{document=await loadStoreLegalDocument(kind,site.locale,version);}catch(error){if(error instanceof PublicApiError&&error.status===404)notFound();throw error;}return <><LegalDocument document={document}/><HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;}
