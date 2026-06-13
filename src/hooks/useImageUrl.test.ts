import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useImageUrl, usePrefetchAdjacentImages } from "./useImageUrl";
import { createWrapper } from "../test/test-utils";

vi.mock("../helpers/getThumbnailUrl", () => ({
  getThumbnailUrl: vi.fn(),
}));

vi.mock("../helpers/getAccelerateUrl", () => ({
  getAccelerateUrl: vi.fn(),
}));

describe("useImageUrl", () => {
  it("returns undefined when not enabled", () => {
    const { result } = renderHook(
      () => useImageUrl("public/album/photo.jpg", false),
      { wrapper: createWrapper() },
    );
    expect(result.current).toBeUndefined();
  });

  it("fetches thumbnail URL for images", async () => {
    const { getThumbnailUrl } = await import("../helpers/getThumbnailUrl");
    vi.mocked(getThumbnailUrl).mockResolvedValue(
      new URL("https://example.com/thumb.jpg"),
    );

    const { result } = renderHook(
      () => useImageUrl("public/album/photo.jpg", true),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current).toBe("https://example.com/thumb.jpg");
    });
  });

  it("falls back to full URL when thumbnail fails", async () => {
    const { getThumbnailUrl } = await import("../helpers/getThumbnailUrl");
    const { getAccelerateUrl } = await import("../helpers/getAccelerateUrl");
    vi.mocked(getThumbnailUrl).mockRejectedValue(new Error("Not found"));
    vi.mocked(getAccelerateUrl).mockResolvedValue(
      new URL("https://example.com/full.jpg"),
    );

    const { result } = renderHook(
      () => useImageUrl("public/album/photo.jpg", true),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current).toBe("https://example.com/full.jpg");
    });
  });

  it("fetches full URL directly for videos", async () => {
    const { getAccelerateUrl } = await import("../helpers/getAccelerateUrl");
    vi.mocked(getAccelerateUrl).mockResolvedValue(
      new URL("https://example.com/video.mp4"),
    );

    const { result } = renderHook(
      () => useImageUrl("public/album/video.mp4", true),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current).toBe("https://example.com/video.mp4");
    });
  });

  it("uses full variant when specified", async () => {
    const { getAccelerateUrl } = await import("../helpers/getAccelerateUrl");
    vi.mocked(getAccelerateUrl).mockResolvedValue(
      new URL("https://example.com/full.jpg"),
    );

    const { result } = renderHook(
      () => useImageUrl("public/album/photo.jpg", true, "full"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current).toBe("https://example.com/full.jpg");
    });
  });
});

describe("usePrefetchAdjacentImages", () => {
  it("does nothing when currentKey is undefined", async () => {
    const { getAccelerateUrl } = await import("../helpers/getAccelerateUrl");
    vi.mocked(getAccelerateUrl).mockClear();

    renderHook(
      () => usePrefetchAdjacentImages(["a.jpg", "b.jpg", "c.jpg"], undefined),
      { wrapper: createWrapper() },
    );

    expect(getAccelerateUrl).not.toHaveBeenCalled();
  });

  it("prefetches adjacent image URLs", async () => {
    const { getAccelerateUrl } = await import("../helpers/getAccelerateUrl");
    vi.mocked(getAccelerateUrl).mockResolvedValue(
      new URL("https://example.com/img.jpg"),
    );

    const keys = ["a.jpg", "b.jpg", "c.jpg"];
    renderHook(() => usePrefetchAdjacentImages(keys, "b.jpg"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getAccelerateUrl).toHaveBeenCalledWith("a.jpg");
      expect(getAccelerateUrl).toHaveBeenCalledWith("c.jpg");
    });
  });

  it("wraps around at boundaries", async () => {
    const { getAccelerateUrl } = await import("../helpers/getAccelerateUrl");
    vi.mocked(getAccelerateUrl).mockResolvedValue(
      new URL("https://example.com/img.jpg"),
    );

    const keys = ["a.jpg", "b.jpg", "c.jpg"];
    renderHook(() => usePrefetchAdjacentImages(keys, "a.jpg"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getAccelerateUrl).toHaveBeenCalledWith("c.jpg");
      expect(getAccelerateUrl).toHaveBeenCalledWith("b.jpg");
    });
  });
});
