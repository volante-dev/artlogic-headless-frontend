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
