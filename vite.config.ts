import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync } from "fs";
import { resolve } from "path";
import { fakeS3Plugin } from "./vite/fakeS3Plugin";

// The generated amplify_outputs.json is gitignored; without AWS credentials
// (CI, the fake backend, a fresh clone) the committed fallback keeps the build
// green. The fake backend never reads it.
export function amplifyOutputsPath(
  root: string,
  backend: string | undefined,
): string {
  const generated = resolve(root, "amplify_outputs.json");
  if (backend !== "fake" && existsSync(generated)) return generated;
  return resolve(root, "src/backend/amplify/outputs.fallback.json");
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), fakeS3Plugin()],
  resolve: {
    alias: {
      "$amplify-outputs": amplifyOutputsPath(
        __dirname,
        process.env.VITE_BACKEND ?? (mode === "fake" ? "fake" : undefined),
      ),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-amplify": ["@aws-amplify/ui-react", "aws-amplify"],
          "vendor-mui": [
            "@mui/material",
            "@mui/icons-material",
            "@emotion/react",
            "@emotion/styled",
          ],
          "vendor-react": ["react", "react-dom", "@tanstack/react-query"],
        },
      },
    },
  },
}));
