'use client';
import {useRuntimeText} from "@/lib/i18n/use-runtime-text";
import Image from 'next/image';
import type {ReactNode} from 'react';
import {useConsent} from './ConsentProvider';
import {useEditorialExecution} from '@/lib/editorial/execution';
import styles from './Consent.module.css';
export function ExternalMediaGate({children,provider,poster}:{children:ReactNode;provider:'YouTube'|'Vimeo';poster?:string}){
 const text=useRuntimeText();
 const consent=useConsent(),mode=useEditorialExecution();if(mode==='inert'||consent.allowed('external_media'))return children;
 // The optional poster must come from our media pipeline; never fetch provider thumbnails.
 const safePoster=poster&&(poster.startsWith('/')&&!poster.startsWith('//'))?poster:undefined;
 return <div className={styles.gate}>{safePoster&&<Image src={safePoster} alt="" fill unoptimized sizes="100vw"/>}<div><p>{text("core.externalMediaBlocked",{provider})}</p><button type="button" onClick={consent.openPreferences}>{text("ui.4e0c4b2a2cb40359")}</button></div></div>;
}
