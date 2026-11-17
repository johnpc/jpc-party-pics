import { describe, it, expect } from "vitest";
import {
  DEMO_IMAGE_COUNT,
  demoImages,
  seedState,
  weddingImages,
} from "./fakeSeed";

describe("fakeSeed", () => {
  it("seeds a Demo album large enough to paginate, newest first", () => {
    const images = demoImages();
    expect(images).toHaveLength(DEMO_IMAGE_COUNT);
    expect(DEMO_IMAGE_COUNT).toBeGreaterThan(24);
    expect(images[0].key).toBe("public/Demo/seed/demo-01.jpg");
    const dates = images.map((i) => new Date(i.date).getTime());
    expect([...dates].sort((a, b) => b - a)).toEqual(dates);
  });

  it("seeds the wedding album with a real photo and a video fixture", () => {
    const keys = weddingImages().map((i) => i.key);
    expect(keys).toContain("public/wedding/seed/test-photo.jpg");
    expect(keys).toContain("public/wedding/seed/tiny.webm");
  });

  it("includes the albums the e2e features navigate to", () => {
    const state = seedState();
    const names = state.albums.map((a) => a.albumName);
    for (const name of ["Demo", "wedding", "e2e-test", "empty-test-album"]) {
      expect(names).toContain(name);
      expect(state.images[name]).toBeDefined();
    }
    expect(state.images["empty-test-album"]).toEqual([]);
    expect(state.images["my-event"]).toHaveLength(2);
  });
});
