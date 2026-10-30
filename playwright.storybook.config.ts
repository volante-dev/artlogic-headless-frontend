import {defineConfig,devices} from "@playwright/test";
export default defineConfig({
  testDir:"./tests/storybook",testMatch:"**/*.spec.ts",workers:1,fullyParallel:false,timeout:90_000,
  use:{baseURL:process.env.STORYBOOK_TEST_ORIGIN,trace:"retain-on-failure"},
  projects:[{name:"chromium",use:{...devices["Desktop Chrome"]}},{name:"webkit",use:{...devices["Desktop Safari"]}}],reporter:[["list"]],
  outputDir:"test-results/storybook",
});
