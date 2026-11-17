import { defineConfig } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const testDir = defineBddConfig({
  features: "e2e/features/**/*.feature",
  steps: "e2e/steps/**/*.steps.ts",
});

// Default: the in-process fake backend (zero network, deterministic seed).
// `E2E_BACKEND=real` (npm run e2e:real) drives the live Amplify backend
// instead and needs a generated amplify_outputs.json.
const realBackend = process.env.E2E_BACKEND === "real";

export default defineConfig({
  testDir,
  timeout: 30000,
  // Flaky tests are not a thing here: no retries, ever. A failure is a race
  // to find and fix in the harness or the app (see AGENTS.md).
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    hasTouch: true,
    permissions: ["camera", "microphone"],
    trace: "retain-on-failure",
    launchOptions: {
      args: [
        "--use-fake-device-for-media-stream",
        "--use-fake-ui-for-media-stream",
      ],
    },
  },
  webServer: {
    command: realBackend ? "npm run dev" : "npm run dev:fake",
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
