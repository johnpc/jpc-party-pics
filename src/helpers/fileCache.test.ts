import { describe, it, expect } from "vitest";
import { cacheFile, getFileFromCache } from "./fileCache";

describe("fileCache", () => {
  it("stores and retrieves a file", async () => {
    const file = new File(["hello world"], "test.txt", { type: "text/plain" });
    await cacheFile("cache-1", file);

    const retrieved = await getFileFromCache("cache-1");
    expect(retrieved).not.toBeNull();
    expect(retrieved!.name).toBe("test.txt");
    expect(retrieved!.type).toBe("text/plain");
  });

  it("returns null for missing cache entry", async () => {
    const result = await getFileFromCache("nonexistent");
    expect(result).toBeNull();
  });
});
