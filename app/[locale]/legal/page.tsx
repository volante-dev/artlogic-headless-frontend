import {Suspense} from "react";
import {HeaderRouteCommit} from "@/components/header/HeaderRouteCommit";
import {loadHeaderRouteContext} from "@/lib/header/load-route-context";
import {loadSiteContent} from "@/lib/i18n/load-site-content";
import {pageAlternates} from "@/lib/seo/metadata";
import styles from "./page.module.css";

export async function generateMetadata(){const site=await loadSiteContent(),en=site.locale.startsWith("en"),title=(en?"Legal notice":"Mentions légales")+" — "+site.siteName,description=en?`Legal information, hosting and privacy information for ${site.siteName}.`:`Informations légales, hébergement et protection des données de la ${site.siteName}.`;return {title,description,alternates:pageAlternates("/legal",site.locale,site.policy,site.siteOrigin),openGraph:{title,description}};}

async function LegalContent(){const site=await loadSiteContent(),en=site.locale.startsWith("en");return <><article className={styles.page}>
 <h1>{en?"Legal notice":"Mentions légales"}</h1>
 <h2>{en?"Gallery contact details":"Coordonnées de la galerie"}</h2>
 <address><p>{site.siteName}<br/>11 rue Bonaparte, 75006 Paris, France<br/><a href="mailto:contact@lucasratton.com">contact@lucasratton.com</a><br/><a href="tel:+33146330624">+33 (0)1 46 33 06 24</a></p></address>
 <h2>{en?"Website publisher":"Éditeur du site"}</h2>
 <p>GALERIE RATTON — {en?"single-member limited liability company (SARL), share capital":"société à responsabilité limitée à associé unique, au capital de"} 3 034 000 €.<br/>SIREN : 331 980 151 · RCS Paris : 331 980 151.<br/>{en?"Registered office":"Siège social"} : 11 rue Bonaparte, 75006 Paris, France.<br/>{en?"Trading name":"Nom commercial"} : Lucas RATTON.</p>
 <p>{en?"Managing director and publication director":"Gérant et directeur de la publication"} : Lucas-Philippe Maurice Roger Ratton.</p>
 <h2>{en?"Hosting and technical services":"Hébergement et services techniques"}</h2>
 <p>{en?"The website is hosted by Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, United States.":"Le site est hébergé par Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis."} <a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noopener noreferrer">Vercel</a>.</p>
 <p>{en?"The application API is hosted on Render. Supabase provides storage and media delivery services.":"L’API applicative est hébergée sur Render. Supabase assure les services de stockage et de diffusion des médias."} <a href="https://render.com/privacy" target="_blank" rel="noopener noreferrer">Render</a> · <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase</a>.</p>
 <h2>{en?"Content and images":"Contenus et images"}</h2>
 <p>{en?"Texts, photographs and reproductions of artworks are protected by the rights of their respective authors and rights holders. For any request to reproduce or use a document, please contact the gallery.":"Les textes, photographies et reproductions d’œuvres sont protégés par les droits de leurs auteurs et ayants droit respectifs. Pour toute demande de reproduction ou d’utilisation d’un document, contactez la galerie."}</p>
 <h2>{en?"Personal data":"Données personnelles"}</h2>
 <p>{en?"Information submitted through the contact and appraisal forms is used to process your enquiry and respond to you. Required fields are identified in the forms. Please send only the information and documents necessary for your request.":"Les informations transmises par les formulaires de contact et d’expertise servent à traiter votre demande et à vous répondre. Les champs obligatoires sont identifiés dans les formulaires. Ne transmettez que les informations et documents nécessaires à votre demande."}</p>
 <p>{en?"To ask about the processing of your data or exercise your applicable rights of access, rectification, erasure, restriction or objection, contact ":"Pour toute question relative au traitement de vos données ou pour exercer, selon les conditions applicables, vos droits d’accès, de rectification, d’effacement, de limitation ou d’opposition, écrivez à "}<a href="mailto:contact@lucasratton.com">contact@lucasratton.com</a>. {en?"You may also lodge a complaint with the French data protection authority, the CNIL.":"Vous pouvez également adresser une réclamation à la CNIL."} <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">CNIL</a>.</p>
 <h2>{en?"Browser storage":"Stockage dans le navigateur"}</h2>
 <p>{en?"The website uses technical browser storage for features such as language selection and secure form handling.":"Le site utilise des mécanismes de stockage techniques dans le navigateur pour des fonctionnalités telles que le choix de langue et la sécurisation des formulaires."}</p>
 </article><HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;}

export default function LegalPage(){return <Suspense fallback={null}><LegalContent/></Suspense>;}
