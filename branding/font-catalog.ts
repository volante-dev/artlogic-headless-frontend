import catalog from "../public/fonts/catalog.json" with {type:"json"};

export interface BuiltinFontFace {
  path:string;sha256:string;byteSize:number;weight:number;style:"normal"|"italic";unicodeRange:string;
}
export interface BuiltinFont {
  id:string;label:string;fallback:"sans-serif"|"serif";license:string;faces:BuiltinFontFace[];
}
/** Local immutable files only. No font provider or runtime network dependency. */
export const builtinFonts=catalog.fonts as BuiltinFont[];
export const builtinFontPaths=new Set(builtinFonts.flatMap(font=>font.faces.map(face=>face.path)));
export function isBuiltinFontPath(path:string):boolean{return builtinFontPaths.has(path);}

/** Content-addressed URLs let static fonts use a long-lived browser/CDN cache. */
export function builtinFontUrl(face:BuiltinFontFace){return face.path+'?v='+face.sha256.slice(0,16);}
export function orderedBuiltinFaces(faces:readonly BuiltinFontFace[]){
 // CSS font matching prefers the last matching face. Extended subsets include
 // support glyphs (space/A/combining marks) also supplied by the common Latin face.
 return [...faces].sort((a,b)=>Number(!a.path.includes('-latin-ext-'))-Number(!b.path.includes('-latin-ext-')));
}
