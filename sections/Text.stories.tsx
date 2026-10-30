import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {SectionStory} from "../.storybook/SectionStory";
const meta={title:"Sections/Text",component:SectionStory,args:{type:"text"},tags:["autodocs"]} satisfies Meta<typeof SectionStory>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Standard:Story={args:{variant:"standard",state:"normal"}};
export const Narrow:Story={args:{variant:"narrow",state:"normal"}};
export const Long:Story={args:{variant:"standard",state:"long"}};
export const Empty:Story={args:{variant:"standard",state:"empty"}};
