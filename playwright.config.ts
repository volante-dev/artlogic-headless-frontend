import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", testMatch: "**/*.spec.ts", testIgnore: ["**/storybook/**","**/gallery-mobile*.spec.ts",...(process.env.E2E_CONTACT_FIXTURE?[]:["**/contact-*.spec.ts"])],
  fullyParallel: false, workers: 1, timeout: 30000,
  use: { baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  reporter: [["list"], ["html", { open: "never" }]],
});
