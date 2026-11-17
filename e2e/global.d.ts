import type { FakeBackend } from "../src/backend/fake/fakeBackend";

declare global {
  interface Window {
    __partypicsFake?: FakeBackend;
  }
}

export {};
