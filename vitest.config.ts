/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "$amplify/env/getPartyPicsImages": resolve(
        __dirname,
        "amplify/function/__mocks__/env.ts",
      ),
      "$amplify-outputs": resolve(
        __dirname,
        "src/backend/amplify/outputs.fallback.json",
      ),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["node_modules", ".features-gen", "e2e"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html", "json-summary"],
      thresholds: {
        branches: 65,
        functions: 80,
        lines: 80,
        statements: 80,
      },
      include: ["src/**/*.{ts,tsx}", "amplify/function/*.ts"],
      exclude: [
        "src/vite-env.d.ts",
        "src/test/**",
        "src/main.tsx",
        "amplify/function/resource.ts",
        "src/backend/index.ts",
      ],
    },
  },
});
