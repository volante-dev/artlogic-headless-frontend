import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {SectionStory} from "../.storybook/SectionStory";
const meta={title:"Sections/ArticleSelection",component:SectionStory,args:{type:"articleSelection"},tags:["autodocs"]} satisfies Meta<typeof SectionStory>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Grid:Story={args:{variant:"grid",state:"normal"}};
export const Compact:Story={args:{variant:"compact",state:"normal"}};
export const Long:Story={args:{variant:"grid",state:"long"}};
export const Empty:Story={args:{variant:"grid",state:"empty"}};
