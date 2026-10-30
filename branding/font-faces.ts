import {builtinFonts,isBuiltinFontPath} from "./font-catalog";
import type {PresentationAsset,PresentationTheme} from "../lib/presentation/types";
import {publicAssetPath} from "../lib/presentation/types";

export function fontFamily(id:string):string{
  const builtin=builtinFonts.find(font=>font.id===id);
  if(builtin)return '"site_'+builtin.id.replace(/^builtin:/,"").replaceAll("-","_")+'", '+builtin.fallback;
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))throw new Error("unknown_font_family");
  return '"site_font_'+id.replaceAll("-","").toLowerCase()+'", sans-serif';
}
export function fontFaces(theme:PresentationTheme,files:readonly PresentationAsset[],scope:"public"|"preview"="public"):string{
  const declarations=new Set<string>();
  for(const role of Object.values(theme.typography)){
    const family=fontFamily(role.familyId).split(",")[0],builtin=builtinFonts.find(font=>font.id===role.familyId);
    if(builtin){
      for(const face of builtin.faces.filter(face=>face.weight===role.weight&&face.style===role.style)){
        if(!isBuiltinFontPath(face.path)||!/^[U+0-9A-Fa-f,\- ]+$/.test(face.unicodeRange))throw new Error("invalid_builtin_font");
        declarations.add(`@font-face{font-family:${family};src:url("${face.path}") format("woff2");font-weight:${face.weight};font-style:${face.style};font-display:swap;unicode-range:${face.unicodeRange};}`);
      }
    }else{
      for(const file of files.filter(file=>file.kind==="font"&&file.font?.familyId===role.familyId&&file.font.weight===role.weight&&file.font.style===role.style)){
        let path:string;
        if(scope==="public")path=publicAssetPath(file.path);
        else{if(!/^\/v1\/preview\/assets\/[0-9a-f-]{36}$/.test(file.path))throw new Error("invalid_preview_font_path");path=file.path.replace("/v1/preview/assets/","/preview/assets/");}
        declarations.add(`@font-face{font-family:${family};src:url("${path}") format("woff2");font-weight:${role.weight};font-style:${role.style};font-display:swap;}`);
      }
    }
  }
  return [...declarations].join("\n");
}
