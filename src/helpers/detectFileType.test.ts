import { describe, it, expect } from "vitest";
import { detectFileType } from "./detectFileType";

describe("detectFileType", () => {
  it("returns 'image' for .jpg files", () => {
    expect(detectFileType("photo.jpg")).toBe("image");
  });

  it("returns 'image' for .jpeg files", () => {
    expect(detectFileType("photo.jpeg")).toBe("image");
  });

  it("returns 'image' for .png files", () => {
    expect(detectFileType("photo.png")).toBe("image");
  });

  it("returns 'image' for .gif files", () => {
    expect(detectFileType("animation.gif")).toBe("image");
  });

  it("returns 'image' for .bmp files", () => {
    expect(detectFileType("bitmap.bmp")).toBe("image");
  });

  it("returns 'image' for .webp files", () => {
    expect(detectFileType("photo.webp")).toBe("image");
  });

  it("returns 'image' for .svg files", () => {
    expect(detectFileType("icon.svg")).toBe("image");
  });

  it("returns 'video' for .mp4 files", () => {
    expect(detectFileType("video.mp4")).toBe("video");
  });

  it("returns 'video' for .avi files", () => {
    expect(detectFileType("video.avi")).toBe("video");
  });

  it("returns 'video' for .mov files", () => {
    expect(detectFileType("video.mov")).toBe("video");
  });

  it("returns 'video' for .wmv files", () => {
    expect(detectFileType("video.wmv")).toBe("video");
  });

  it("returns 'video' for .flv files", () => {
    expect(detectFileType("video.flv")).toBe("video");
  });

  it("returns 'video' for .mkv files", () => {
    expect(detectFileType("video.mkv")).toBe("video");
  });

  it("returns 'video' for .webm files", () => {
    expect(detectFileType("video.webm")).toBe("video");
  });

  it("returns 'unknown' for unrecognized extensions", () => {
    expect(detectFileType("document.pdf")).toBe("unknown");
  });

  it("returns 'unknown' for files with no extension", () => {
    expect(detectFileType("README")).toBe("unknown");
  });

  it("is case-insensitive", () => {
    expect(detectFileType("PHOTO.JPG")).toBe("image");
    expect(detectFileType("VIDEO.MP4")).toBe("video");
    expect(detectFileType("Photo.PNG")).toBe("image");
  });

  it("handles file paths with directories", () => {
    expect(detectFileType("public/album/hash/photo.jpg")).toBe("image");
    expect(detectFileType("/path/to/video.mp4")).toBe("video");
  });
});
