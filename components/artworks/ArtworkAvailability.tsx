import styles from './ArtworkAvailability.module.css';
/** A missing or unknown source value must never claim that a work is available. */
export function ArtworkAvailability({availableForSale,locale,finaleOnly=false}:{availableForSale?:boolean|null;locale:string;finaleOnly?:boolean}){
 if(availableForSale!==true)return null;
 const english=locale.split('-')[0]==='en';
 return <div className={[styles.availability,finaleOnly?styles.finaleOnly:''].filter(Boolean).join(' ')} data-artwork-availability lang={english?'en':'fr'}><span className={styles.dot} aria-hidden="true"/><strong>{english?'AVAILABLE':'DISPONIBLE'}</strong></div>;
}
