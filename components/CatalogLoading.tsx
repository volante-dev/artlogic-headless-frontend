"use client";
import CircularProgress from "@mui/material/CircularProgress";
import {useSiteContent} from "./SiteContentProvider";
import styles from "./CatalogLoading.module.css";
/** Page data loads inside main; the surrounding header remains available. */
export function CatalogLoading({artwork=false}:{artwork?:boolean}){const {messages}=useSiteContent();return <div className={styles.loading} data-testid="catalog-loading" aria-busy="true"><CircularProgress disableShrink size={28} thickness={2} color="inherit" aria-label={messages[artwork?"artwork.loading":"catalog.loading"]}/></div>;}
