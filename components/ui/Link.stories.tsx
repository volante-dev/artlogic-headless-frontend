import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {Link} from "./Link";
const meta={title:"Primitives/Link",component:Link,args:{href:"#contenu",children:"Découvrir la collection"},decorators:[Story=><div id="contenu" style={{padding:24}}><Story/></div>],tags:["autodocs"]} satisfies Meta<typeof Link>;export default meta;
type Story=StoryObj<typeof meta>;
export const Internal:Story={};
export const Email:Story={args:{href:"mailto:gallery@example.invalid",children:"Écrire à la galerie"}};
export const Long:Story={args:{children:"Découvrir les œuvres de la collection de démonstration et leur contexte"}};
