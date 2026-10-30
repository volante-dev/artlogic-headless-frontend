import type {StorybookConfig} from "@storybook/nextjs-vite";
const config:StorybookConfig={
  framework:"@storybook/nextjs-vite",
  stories:["../components/**/*.stories.tsx","../branding/**/*.stories.tsx","../sections/**/*.stories.tsx"],
  addons:["@storybook/addon-docs","@storybook/addon-a11y"],
  staticDirs:["../public","./public"],
  core:{disableTelemetry:true},
};
export default config;
