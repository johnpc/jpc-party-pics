import { describe, it, expect, vi, beforeEach } from "vitest";

describe("canPlayVideoFile", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns false in jsdom (no codec support)", async () => {
    const { canPlayVideoFile } = await import("./videoSupport");
    expect(canPlayVideoFile("test.webm")).toBe(false);
    expect(canPlayVideoFile("test.mkv")).toBe(false);
  });

  it("returns true when canPlayType reports support", async () => {
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = origCreateElement(tag);
      if (tag === "video") {
        el.canPlayType = (mime: string) => {
          if (mime === "video/mp4") return "probably";
          return "";
        };
      }
      return el;
    });

    const { canPlayVideoFile } = await import("./videoSupport");
    expect(canPlayVideoFile("test.mp4")).toBe(true);
    expect(canPlayVideoFile("test.mov")).toBe(true);
    expect(canPlayVideoFile("test.webm")).toBe(false);
  });

  it("returns false for unknown extensions", async () => {
    const { canPlayVideoFile } = await import("./videoSupport");
    expect(canPlayVideoFile("test.xyz")).toBe(false);
  });

  it("returns false for files with no extension", async () => {
    const { canPlayVideoFile } = await import("./videoSupport");
    expect(canPlayVideoFile("noextension")).toBe(false);
  });
});
