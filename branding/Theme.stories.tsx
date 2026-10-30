import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {Typography} from "../components/ui/Typography";
import {Button} from "../components/ui/Button";
import {Link} from "../components/ui/Link";
import {projectionTheme} from "../clients/default/manifest";
function ThemeStory(){return <main id="contenu"><Typography variant="h1">Forme, matière et regard</Typography><Typography variant="h2">Une identité configurable</Typography><Typography>Échantillon de caractères : À Â Æ Ç É È Ê Ë Î Ï Ô Œ Ù Û Ü Ÿ — € £ ¥. Fallback : 日本語.</Typography><div style={{display:"flex",flexWrap:"wrap",gap:16,marginBlock:32}}><Button>Découvrir</Button><Button variant="outlined">Contacter</Button><Button disabled>Indisponible</Button><Link href="#palette">Voir les couleurs</Link></div><Typography variant="h2" id="palette">Rôles de couleur</Typography><dl style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",gap:24}}>{Object.keys(projectionTheme.colors).map(role=><div key={role}><dt>{role}</dt><dd style={{margin:0,height:48,background:`var(--site-color-${role})`,border:"1px solid var(--site-color-border)"}} aria-label={role}/></div>)}</dl></main>;}
const meta={title:"Branding/Theme",component:ThemeStory,tags:["autodocs"]} satisfies Meta<typeof ThemeStory>;export default meta;
type Story=StoryObj<typeof meta>;
export const Projection:Story={};
export const Editorial:Story={globals:{theme:"editorial",profile:"demo-gallery"}};
