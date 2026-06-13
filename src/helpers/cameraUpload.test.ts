import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadPhoto, uploadVideo, isVideoTooShort } from "./cameraUpload";

const mockUploadData = vi.fn().mockReturnValue({ result: Promise.resolve({}) });
const mockCompressMedia = vi.fn();

vi.mock("aws-amplify/storage", () => ({
  uploadData: (...args: unknown[]) => mockUploadData(...args),
}));

vi.mock("./compressMedia", () => ({
  compressMedia: (...args: unknown[]) => mockCompressMedia(...args),
}));

describe("cameraUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCompressMedia.mockImplementation(
      (params: { file: File; key: string }) => Promise.resolve(params),
    );
  });

  describe("isVideoTooShort", () => {
    it("returns true for blobs under 50KB", () => {
      const tiny = new Blob(["x"]);
      expect(isVideoTooShort(tiny)).toBe(true);
    });

    it("returns false for blobs at or above 50KB", () => {
      const large = new Blob([new Uint8Array(50_000)]);
      expect(isVideoTooShort(large)).toBe(false);
    });
  });

  describe("uploadPhoto", () => {
    it("compresses and uploads the photo blob", async () => {
      const blob = new Blob(["photo-data"], { type: "image/jpeg" });
      const key = await uploadPhoto(blob, "wedding", "abc12");

      expect(mockCompressMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          key: expect.stringContaining("public/wedding/abc12/"),
        }),
      );
      expect(mockUploadData).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(File),
          options: { useAccelerateEndpoint: true },
        }),
      );
      expect(key).toContain("public/wedding/abc12/");
    });
  });

  describe("uploadVideo", () => {
    it("uploads the video blob with correct path", async () => {
      const blob = new Blob(["video-data"], { type: "video/webm" });
      const key = await uploadVideo(blob, "video/webm", "webm", "party", "xyz");

      expect(mockUploadData).toHaveBeenCalledWith(
        expect.objectContaining({
          path: expect.stringContaining("public/party/xyz/"),
          options: { useAccelerateEndpoint: true },
        }),
      );
      expect(key).toContain("public/party/xyz/");
      expect(key).toContain(".webm");
    });
  });
});
