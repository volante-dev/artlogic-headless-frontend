import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {SectionStory} from "../.storybook/SectionStory";
const meta={title:"Sections/ArtworkCatalog",component:SectionStory,args:{type:"artworkCatalog"},parameters:{nextjs:{appDirectory:true}},tags:["autodocs"]} satisfies Meta<typeof SectionStory>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Grid:Story={args:{variant:"grid",state:"normal"}};
export const Long:Story={args:{variant:"grid",state:"long"}};
export const Empty:Story={args:{variant:"grid",state:"empty"}};
