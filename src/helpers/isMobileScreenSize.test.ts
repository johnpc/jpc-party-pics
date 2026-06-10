import { describe, it, expect, vi } from "vitest";

describe("isMobileScreenSize", () => {
  it("returns false when clientWidth >= 1000", async () => {
    Object.defineProperty(document.documentElement, "clientWidth", {
      value: 1200,
      writable: true,
    });
    const mod = await import("./isMobileScreenSize");
    expect(mod.isMobileScreenSize).toBe(false);
  });

  it("returns true when clientWidth < 1000", async () => {
    Object.defineProperty(document.documentElement, "clientWidth", {
      value: 800,
      writable: true,
    });
    vi.resetModules();
    const mod = await import("./isMobileScreenSize");
    expect(mod.isMobileScreenSize).toBe(true);
  });
});
