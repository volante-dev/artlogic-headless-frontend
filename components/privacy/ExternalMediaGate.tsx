'use client';
import Image from 'next/image';
import type {ReactNode} from 'react';
import {useConsent} from './ConsentProvider';
import {useEditorialExecution} from '@/lib/editorial/execution';
import styles from './Consent.module.css';
export function ExternalMediaGate({children,provider,poster}:{children:ReactNode;provider:'YouTube'|'Vimeo';poster?:string}){
 const consent=useConsent(),mode=useEditorialExecution();if(mode==='inert'||consent.allowed('external_media'))return children;
 // The optional poster must come from our media pipeline; never fetch provider thumbnails.
 const safePoster=poster&&(poster.startsWith('/')&&!poster.startsWith('//'))?poster:undefined,en=consent.locale.startsWith('en');
 return <div className={styles.gate}>{safePoster&&<Image src={safePoster} alt="" fill unoptimized sizes="100vw"/>}<div><p>{en?'This '+provider+' video is blocked until you allow external media.':'Cette vidéo '+provider+' reste bloquée tant que les médias externes ne sont pas autorisés.'}</p><button type="button" onClick={consent.openPreferences}>{en?'Choose privacy preferences':'Choisir mes préférences'}</button></div></div>;
}
