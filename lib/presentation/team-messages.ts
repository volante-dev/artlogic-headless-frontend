const fr={founders:'Fondateurs',members:'Membres',empty:'Aucune personne complète et visible n’est disponible dans cet aperçu.',email:(name:string)=>`Écrire à ${name}`,phone:(name:string)=>`Appeler ${name}`};
const en={founders:'Founders',members:'Gallery team',empty:'No complete, visible team member is available in this preview.',email:(name:string)=>`Email ${name}`,phone:(name:string)=>`Call ${name}`};
export const teamMessages=(locale:string,defaultLocale='en')=>locale.split('-')[0]==='fr'?fr:locale.split('-')[0]==='en'?en:defaultLocale.split('-')[0]==='fr'?fr:en;
