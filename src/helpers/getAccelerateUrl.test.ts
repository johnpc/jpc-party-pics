import { describe, it, expect, vi } from "vitest";
import { getAccelerateUrl } from "./getAccelerateUrl";
import { getUrl } from "aws-amplify/storage";

vi.mock("aws-amplify/storage", () => ({
  getUrl: vi.fn(),
}));

describe("getAccelerateUrl", () => {
  it("returns the URL from getUrl", async () => {
    const mockUrl = new URL("https://bucket.s3-accelerate.amazonaws.com/key");
    vi.mocked(getUrl).mockResolvedValue({ url: mockUrl } as never);

    const result = await getAccelerateUrl("public/album/photo.jpg");
    expect(result).toBe(mockUrl);
  });

  it("calls getUrl with correct options", async () => {
    const mockUrl = new URL("https://example.com/photo.jpg");
    vi.mocked(getUrl).mockResolvedValue({ url: mockUrl } as never);

    await getAccelerateUrl("public/album/photo.jpg");

    expect(getUrl).toHaveBeenCalledWith({
      path: "public/album/photo.jpg",
      options: {
        validateObjectExistence: false,
        expiresIn: 300,
        useAccelerateEndpoint: true,
      },
    });
  });
});
