"use client";
import {preload} from "react-dom";
import {useMemo} from "react";
import {useSiteLocale} from "../components/SiteLocaleBoundary";
import {ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v16-appRouter";
import type {PresentationAsset,PresentationTheme} from "../lib/presentation/types";
import {createSiteTheme,siteVariables} from "./create-site-theme";
import {fontFaces,criticalBuiltinFontUrls} from "./font-faces";

export function SiteThemeProvider({theme,fonts,scope="public",children}:{theme:PresentationTheme;fonts:readonly PresentationAsset[];scope?:"public"|"preview";children:React.ReactNode}){
  const translated=useSiteLocale()?.translation?.presentation;
  const current=scope==="public"&&translated?.pageKey==="galerist"?translated:null;
  const proposedTheme=current?.theme??theme,proposedFonts=current?.fontFiles??fonts;
  const themeKey=JSON.stringify(proposedTheme),fontsKey=JSON.stringify(proposedFonts);
  const activeTheme=useMemo(()=>JSON.parse(themeKey) as PresentationTheme,[themeKey]);
  const activeFonts=useMemo(()=>JSON.parse(fontsKey) as PresentationAsset[],[fontsKey]);
  for(const href of criticalBuiltinFontUrls(activeTheme))preload(href,{as:"font",type:"font/woff2",crossOrigin:"anonymous"});
  const mui=useMemo(()=>createSiteTheme(activeTheme),[activeTheme]);
  const css=useMemo(()=>fontFaces(activeTheme,activeFonts,scope)+siteVariables(activeTheme),[activeTheme,activeFonts,scope]);
  return <AppRouterCacheProvider options={{key:"gallery",enableCssLayer:true}}><ThemeProvider theme={mui}><CssBaseline/><GlobalStyles styles={css}/>{children}</ThemeProvider></AppRouterCacheProvider>;
}
