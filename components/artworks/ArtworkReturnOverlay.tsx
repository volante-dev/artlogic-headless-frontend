'use client';
import {useCallback,useSyncExternalStore} from 'react';
import {SiteLoading} from '../SiteLoading';
import {useArtworkOpening} from './ArtworkOpeningBoundary';
import styles from './ArtworkDialogShell.module.css';
export function ArtworkReturnOverlay(){
 const opening=useArtworkOpening();
 const phase=useSyncExternalStore(opening?.subscribe??(()=>()=>{}),()=>opening?.returning.phase??'idle',()=>'idle');
 const attach=useCallback((node:HTMLDivElement|null)=>opening?.returning.setLoader(node),[opening]);
 if(!opening||phase==='idle')return null;
 return <div ref={attach} className={styles.returnOverlay} data-artwork-return-phase={phase}><SiteLoading navigation testId='artwork-return-loading'/></div>;
}
