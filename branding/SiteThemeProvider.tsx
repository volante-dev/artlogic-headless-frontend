"use client";
import {useMemo} from "react";
import {ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v16-appRouter";
import type {PresentationAsset,PresentationTheme} from "../lib/presentation/types";
import {createSiteTheme,siteVariables} from "./create-site-theme";
import {fontFaces} from "./font-faces";

export function SiteThemeProvider({theme,fonts,scope="public",children}:{theme:PresentationTheme;fonts:readonly PresentationAsset[];scope?:"public"|"preview";children:React.ReactNode}){
  const mui=useMemo(()=>createSiteTheme(theme),[theme]);
  const css=useMemo(()=>fontFaces(theme,fonts,scope)+siteVariables(theme),[theme,fonts,scope]);
  return <AppRouterCacheProvider options={{key:"gallery",enableCssLayer:true}}><ThemeProvider theme={mui}><CssBaseline/><GlobalStyles styles={css}/>{children}</ThemeProvider></AppRouterCacheProvider>;
}
