import {Suspense} from 'react';
import {LegalDocumentPage} from '@/components/commerce/LegalDocumentPage';
export const metadata={title:'Confidentialité | Privacy',robots:{index:false,follow:true}};
async function Content({searchParams}:{searchParams:Promise<{version?:string}>}){const {version}=await searchParams;return <LegalDocumentPage kind="privacy" version={version}/>;}
export default function Page(props:{searchParams:Promise<{version?:string}>}){return <Suspense fallback={null}><Content {...props}/></Suspense>;}
