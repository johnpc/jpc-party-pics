import { Backend } from "./types";
import {
  createAmplifyBackend,
  configureAmplify,
} from "./amplify/amplifyBackend";
import { createFakeBackend, FakeBackend } from "./fake/fakeBackend";

export const isFakeBackend = import.meta.env.VITE_BACKEND === "fake";

declare global {
  interface Window {
    __partypicsFake?: FakeBackend;
  }
}

function select(): Backend {
  if (isFakeBackend) {
    const fake = createFakeBackend();
    if (typeof window !== "undefined") window.__partypicsFake = fake;
    return fake;
  }
  configureAmplify();
  return createAmplifyBackend();
}

export const backend: Backend = select();
export type { Backend } from "./types";
