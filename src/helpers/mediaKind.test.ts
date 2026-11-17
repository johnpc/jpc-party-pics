import { describe, it, expect, vi } from "vitest";
import { mediaKind } from "./mediaKind";

const mockCanPlay = vi.fn();
vi.mock("./videoSupport", () => ({
  canPlayVideoFile: (...args: unknown[]) => mockCanPlay(...args),
}));

describe("mediaKind", () => {
  it("classifies images", () => {
    expect(mediaKind("public/a/photo.JPG")).toBe("image");
    expect(mediaKind("public/a/photo.webp")).toBe("image");
  });

  it("classifies playable and unsupported videos", () => {
    mockCanPlay.mockReturnValueOnce(true);
    expect(mediaKind("public/a/clip.mp4")).toBe("video");
    mockCanPlay.mockReturnValueOnce(false);
    expect(mediaKind("public/a/clip.mkv")).toBe("unsupported-video");
  });

  it("hands unknown extensions to the video element (legacy behavior)", () => {
    expect(mediaKind("public/a/mystery.bin")).toBe("video");
    expect(mockCanPlay).not.toHaveBeenCalledWith("public/a/mystery.bin");
  });
});
