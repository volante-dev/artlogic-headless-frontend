import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/storybook/**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**", "storybook-static/**", "**/*.spec.ts"],
    restoreMocks: true,
  },
});
