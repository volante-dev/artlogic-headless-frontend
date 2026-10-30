import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {Typography} from "./Typography";
const meta={title:"Primitives/Typography",component:Typography,args:{children:"Regarder la forme, découvrir la matière"},decorators:[Story=><div style={{padding:24}}><Story/></div>],tags:["autodocs"]} satisfies Meta<typeof Typography>;export default meta;
type Story=StoryObj<typeof meta>;
export const Heading:Story={args:{variant:"h1"}};
export const Body:Story={args:{variant:"body1"}};
export const Caption:Story={args:{variant:"caption"}};
export const Long:Story={args:{variant:"h1",children:"Une collection de démonstration pour observer la composition et le rythme de lecture à toutes les largeurs"}};
