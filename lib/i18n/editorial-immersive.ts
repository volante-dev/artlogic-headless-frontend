const fr={progress:'Parcours de lecture',view:'Section',of:'sur',previous:'Section précédente',next:'Section suivante',exit:'Quitter la lecture',retry:'Réessayer',unavailable:'Ce visuel est indisponible.'};
const en:typeof fr={progress:'Reading progress',view:'Section',of:'of',previous:'Previous section',next:'Next section',exit:'Leave the article',retry:'Try again',unavailable:'This image is unavailable.'};
const dictionaries:Readonly<Record<string,typeof fr>>={fr,en};
/** Dedicated UI labels, never changes the global site-content catalogue/fingerprint. */
export function immersiveMessages(locale:string,defaultLocale:string){return dictionaries[locale]??dictionaries[defaultLocale]??fr;}
