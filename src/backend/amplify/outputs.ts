import outputs from "$amplify-outputs";

// `$amplify-outputs` resolves (vite.config.ts / vitest.config.ts) to the
// generated amplify_outputs.json when it exists, else to outputs.fallback.json
// so the app still type-checks and builds without AWS credentials.
export const amplifyOutputs = outputs;
export const zipFileEndpoint: string = outputs.custom.zipFileEndpoint;
