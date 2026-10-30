import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {SectionStory} from "../.storybook/SectionStory";
const meta={title:"Sections/TextImage",component:SectionStory,args:{type:"textImage"},tags:["autodocs"]} satisfies Meta<typeof SectionStory>;
export default meta;
type Story=StoryObj<typeof meta>;
export const ImageLeft:Story={args:{variant:"imageLeft",state:"normal"}};
export const ImageRight:Story={args:{variant:"imageRight",state:"normal"}};
export const Long:Story={args:{variant:"imageLeft",state:"long"}};
export const Empty:Story={args:{variant:"imageLeft",state:"empty"}};
