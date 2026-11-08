import type {Meta,StoryObj} from "@storybook/nextjs-vite";
import {FormAnimationsReview} from "./FormAnimationsReview";
const meta={title:"Forms/Appearance comparator",component:FormAnimationsReview,parameters:{layout:"fullscreen"}} satisfies Meta<typeof FormAnimationsReview>;
export default meta;
export const Comparator:StoryObj<typeof meta>={render:(_args,context)=><FormAnimationsReview profile={String(context.globals.profile)}/>};
