import {lightControlShadow,lightControlElevation} from "./control-surface";
import {createTheme} from "@mui/material/styles";
import type {PresentationTheme} from "../lib/presentation/types";
import {fontFamily} from "./font-faces";

export function typographyStyle(role:PresentationTheme["typography"][keyof PresentationTheme["typography"]]){
  const delta=role.maxSizeRem-role.minSizeRem;
  return {fontFamily:fontFamily(role.familyId),fontWeight:role.weight,fontStyle:role.style,fontSize:`clamp(${role.minSizeRem}rem, ${role.minSizeRem-delta*375/1065}rem + ${delta*1600/1065}vw, ${role.maxSizeRem}rem)`,lineHeight:role.lineHeight,letterSpacing:role.letterSpacingEm+"em"};
}
export function siteVariables(value:PresentationTheme):string{
  const colors=Object.entries(value.colors).map(([role,color])=>{
    if(!/^[a-zA-Z]+$/.test(role)||!/^#[0-9a-fA-F]{6}$/.test(color))throw new Error("invalid_theme_color");
    return `--site-color-${role}:${color};`;
  });
  const fonts=Object.entries(value.typography).flatMap(([role,settings])=>Object.entries(typographyStyle(settings)).map(([property,setting])=>`--site-${role}-${property}:${setting};`));
  return ":root{"+[...colors,...fonts,`--site-control-shadow-light:${lightControlShadow};`].join("")+"}";
}
export function createSiteTheme(value:PresentationTheme){
  const colors=value.colors,roles=value.typography;
  const lightSurface={...lightControlElevation,backgroundColor:colors.surface,color:colors.text,"&.Mui-disabled":{boxShadow:"none",color:colors.disabledText,backgroundColor:colors.mutedSurface}};
  return createTheme({
    cssVariables:{cssVarPrefix:"gallery"},shape:{borderRadius:0},
    palette:{mode:"light",background:{default:colors.background,paper:colors.surface},text:{primary:colors.text,secondary:colors.mutedText,disabled:colors.disabledText},primary:{main:colors.accent,contrastText:colors.onAccent},error:{main:colors.error,contrastText:colors.onError},success:{main:colors.success,contrastText:colors.onSuccess},warning:{main:colors.warning,contrastText:colors.onWarning},divider:colors.border,action:{disabled:colors.disabledText,disabledBackground:colors.mutedSurface}},
    typography:{fontFamily:fontFamily(roles.body.familyId),h1:typographyStyle(roles.h1),h2:typographyStyle(roles.h2),h3:typographyStyle(roles.h3),body1:typographyStyle(roles.body),body2:typographyStyle(roles.body),caption:typographyStyle(roles.caption),button:{...typographyStyle(roles.button),textTransform:"none"}},
    components:{
      MuiButtonBase:{defaultProps:{disableRipple:true}},
      MuiButton:{defaultProps:{disableElevation:true,disableRipple:true},styleOverrides:{root:{minHeight:44,borderRadius:0,padding:"10px 18px",textTransform:"none","&[data-control-surface=light],&.MuiButton-contained.MuiButton-colorInherit":lightSurface,"&.Mui-focusVisible":{outline:`2px solid ${colors.text}`,outlineOffset:3},"&.Mui-disabled":{color:colors.disabledText,backgroundColor:colors.mutedSurface}}}},
      MuiIconButton:{styleOverrides:{root:{minWidth:44,minHeight:44,"&[data-control-surface=light]":lightSurface}}},
      MuiOutlinedInput:{styleOverrides:{root:{borderRadius:0,backgroundColor:colors.surface,color:colors.text,"& .MuiOutlinedInput-notchedOutline":{borderColor:colors.border},"&:hover .MuiOutlinedInput-notchedOutline":{borderColor:colors.linkHover},"&.Mui-focused .MuiOutlinedInput-notchedOutline":{borderColor:colors.text,borderWidth:1},"&.Mui-error .MuiOutlinedInput-notchedOutline":{borderColor:colors.error}}}},
      MuiInputLabel:{styleOverrides:{root:{color:colors.mutedText,"&.Mui-focused":{color:colors.text},"&.Mui-error":{color:colors.error}}}},
      MuiFormHelperText:{styleOverrides:{root:{color:colors.mutedText,"&.Mui-error":{color:colors.error}}}},
      MuiLink:{defaultProps:{underline:"always"},styleOverrides:{root:{color:colors.link,textUnderlineOffset:".2em","&:hover":{color:colors.linkHover},"&:focus-visible":{outline:`2px solid ${colors.text}`,outlineOffset:3}}}},
      MuiTypography:{styleOverrides:{root:{overflowWrap:"anywhere"},h1:{textWrap:"balance"},h2:{textWrap:"balance"}}},
      MuiCssBaseline:{styleOverrides:{"[data-control-surface=light]":lightControlElevation,body:{backgroundColor:colors.background,color:colors.text,...typographyStyle(roles.body)},"::selection":{background:colors.selection,color:colors.onSelection},":focus-visible":{outline:`2px solid ${colors.text}`,outlineOffset:3},".MuiInputBase-input:focus-visible":{outline:"none"},"input,textarea":{caretColor:colors.accent},html:{scrollbarColor:`${colors.border} ${colors.background}`}}},
    },
  });
}
