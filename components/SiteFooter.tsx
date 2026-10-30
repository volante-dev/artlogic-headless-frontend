import styles from "./SiteFooter.module.css";
export function SiteFooter({siteName,description}:{siteName:string;description:string}){return <footer className={styles.footer}><span className={styles.name}>{siteName}</span>{description&&<p>{description}</p>}</footer>;}
