import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {IconButton} from "./IconButton";
const glyph=<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>;
const meta={title:"Primitives/IconButton",component:IconButton,args:{"aria-label":"Fermer",children:glyph},decorators:[Story=><div style={{padding:24}}><Story/></div>],tags:["autodocs"]} satisfies Meta<typeof IconButton>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Transparent:Story={};
export const LightSurface:Story={args:{surface:"light"}};
export const Disabled:Story={args:{surface:"light",disabled:true}};
