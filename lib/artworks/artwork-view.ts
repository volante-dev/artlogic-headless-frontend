export type ArtworkViewMode="generic"|"lucas-ratton";
/** A presentation setting is never an authorization or a new site profile. */
export function resolveArtworkView(value:unknown):ArtworkViewMode{return value==="lucas-ratton"?"lucas-ratton":"generic";}
