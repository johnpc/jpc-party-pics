import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

const cacheStore: Record<string, Response> = {};
const mockCache = {
  put: async (key: string, response: Response) => {
    cacheStore[key] = response;
  },
  match: async (key: string) => cacheStore[key] ?? null,
};
Object.defineProperty(globalThis, "caches", {
  value: { open: async () => mockCache },
  writable: true,
});

afterEach(() => {
  cleanup();
});

Object.defineProperty(document.documentElement, "clientWidth", {
  value: 1200,
  writable: true,
});

vi.mock("aws-amplify/api", () => ({
  generateClient: () => ({
    models: {
      Albums: {
        list: vi.fn().mockResolvedValue({ data: [] }),
        create: vi.fn().mockResolvedValue({ data: {}, errors: null }),
      },
      AlbumImageKey: {
        create: vi.fn().mockResolvedValue({ data: {} }),
        delete: vi.fn().mockResolvedValue({ data: {} }),
        onCreate: () => ({ subscribe: () => ({ unsubscribe: vi.fn() }) }),
        onDelete: () => ({ subscribe: () => ({ unsubscribe: vi.fn() }) }),
      },
    },
    queries: {
      getPartyPicsImages: vi.fn().mockResolvedValue({ data: { images: [] } }),
      deletePartyPic: vi.fn().mockResolvedValue({}),
    },
  }),
}));

vi.mock("aws-amplify/storage", () => ({
  getUrl: vi
    .fn()
    .mockResolvedValue({ url: new URL("https://example.com/image.jpg") }),
  uploadData: vi.fn().mockReturnValue({ result: Promise.resolve({}) }),
}));

vi.mock("aws-amplify", () => ({
  Amplify: { configure: vi.fn() },
}));

vi.mock("../../amplify_outputs.json", () => ({
  default: { custom: { zipFileEndpoint: "https://example.com/zip" } },
  custom: { zipFileEndpoint: "https://example.com/zip" },
}));
