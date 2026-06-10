import { describe, it, expect, vi } from "vitest";
import { compressMedia } from "./compressMedia";
import imageCompression from "browser-image-compression";

vi.mock("browser-image-compression", () => ({
  default: vi.fn(),
}));

describe("compressMedia", () => {
  it("skips compression for video files", async () => {
    const file = new File(["video-data"], "test.mp4", { type: "video/mp4" });
    const params = { file, key: "public/album/hash/test.mp4" };

    const result = await compressMedia(params);
    expect(result).toBe(params);
    expect(imageCompression).not.toHaveBeenCalled();
  });

  it("skips compression for files already under MAX_SIZE_MB", async () => {
    const smallData = new Uint8Array(500 * 1024);
    const file = new File([smallData], "small.jpg", { type: "image/jpeg" });
    const params = { file, key: "public/album/hash/small.jpg" };

    const result = await compressMedia(params);
    expect(result).toBe(params);
    expect(imageCompression).not.toHaveBeenCalled();
  });

  it("compresses large image files", async () => {
    const largeData = new Uint8Array(2 * 1024 * 1024);
    const file = new File([largeData], "large.jpg", { type: "image/jpeg" });
    const compressedFile = new File(
      [new Uint8Array(1024 * 1024)],
      "large.jpg",
      {
        type: "image/jpeg",
      },
    );

    vi.mocked(imageCompression).mockResolvedValue(compressedFile as never);

    const params = { file, key: "public/album/hash/large.jpg" };
    const result = await compressMedia(params);

    expect(result.file).toBe(compressedFile);
    expect(result.key).toBe("public/album/hash/large.jpg");
    expect(imageCompression).toHaveBeenCalledWith(file, {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.85,
      fileType: "image/jpeg",
    });
  });

  it("returns original file on compression failure", async () => {
    const largeData = new Uint8Array(2 * 1024 * 1024);
    const file = new File([largeData], "large.jpg", { type: "image/jpeg" });

    vi.mocked(imageCompression).mockRejectedValue(new Error("Failed"));

    const params = { file, key: "public/album/hash/large.jpg" };
    const result = await compressMedia(params);

    expect(result).toBe(params);
  });
});
