import { describe, it, expect, vi } from "vitest";
import { getThumbnailUrl } from "./getThumbnailUrl";
import { getUrl } from "aws-amplify/storage";

vi.mock("aws-amplify/storage", () => ({
  getUrl: vi.fn(),
}));

describe("getThumbnailUrl", () => {
  it("returns the URL from getUrl", async () => {
    const mockUrl = new URL(
      "https://bucket.s3-accelerate.amazonaws.com/thumbnails/album/photo.jpg",
    );
    vi.mocked(getUrl).mockResolvedValue({ url: mockUrl } as never);

    const result = await getThumbnailUrl("public/album/photo.jpg");
    expect(result).toBe(mockUrl);
  });

  it("converts public/ key to thumbnails/ key", async () => {
    const mockUrl = new URL("https://example.com/thumb.jpg");
    vi.mocked(getUrl).mockResolvedValue({ url: mockUrl } as never);

    await getThumbnailUrl("public/wedding/abc/photo.jpg");

    expect(getUrl).toHaveBeenCalledWith({
      path: "thumbnails/wedding/abc/photo.jpg",
      options: {
        validateObjectExistence: true,
        expiresIn: 300,
        useAccelerateEndpoint: true,
      },
    });
  });

  it("throws when thumbnail does not exist", async () => {
    vi.mocked(getUrl).mockRejectedValue(new Error("Object does not exist"));

    await expect(getThumbnailUrl("public/album/photo.jpg")).rejects.toThrow(
      "Object does not exist",
    );
  });
});
