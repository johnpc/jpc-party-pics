import { describe, it, expect, vi, beforeEach } from "vitest";
import { processUploadItem } from "./useUploadProcessor";
import { QueuedUpload } from "../helpers/uploadQueue";

vi.mock("aws-amplify/storage", () => ({
  uploadData: vi.fn(() => ({
    result: Promise.resolve({ path: "test-path" }),
  })),
}));

vi.mock("aws-amplify/api", () => ({
  generateClient: () => ({
    models: {
      AlbumImageKey: {
        create: vi.fn().mockResolvedValue({}),
      },
    },
  }),
}));

vi.mock("../helpers/compressMedia", () => ({
  compressMedia: vi.fn((params: { file: File; key: string }) =>
    Promise.resolve(params),
  ),
}));

const mockGetFile = vi.fn();
vi.mock("../helpers/fileCache", () => ({
  getFileFromCache: (...args: unknown[]) => mockGetFile(...args),
}));

const mockUpdate = vi.fn().mockResolvedValue(undefined);
vi.mock("../helpers/uploadQueue", () => ({
  updateQueueItem: (...args: unknown[]) => mockUpdate(...args),
  removeFromQueue: vi.fn().mockResolvedValue(undefined),
}));

const makeItem = (overrides: Partial<QueuedUpload> = {}): QueuedUpload => ({
  id: "test-1",
  fileName: "photo.jpg",
  fileSize: 1024,
  fileType: "image/jpeg",
  albumName: "wedding",
  status: "pending",
  progress: 0,
  retryCount: 0,
  addedAt: Date.now(),
  ...overrides,
});

describe("processUploadItem", () => {
  const refreshQueue = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks error when file not in cache", async () => {
    mockGetFile.mockResolvedValue(null);
    await processUploadItem(makeItem(), "wedding", "abc", refreshQueue);

    expect(mockUpdate).toHaveBeenCalledWith("test-1", {
      status: "error",
      error: "File no longer available. Please re-select.",
      retryCount: 1,
    });
  });

  it("processes file through full pipeline when cached", async () => {
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    mockGetFile.mockResolvedValue(file);

    await processUploadItem(makeItem(), "wedding", "abc", refreshQueue);

    expect(mockUpdate).toHaveBeenCalledWith("test-1", {
      status: "compressing",
      progress: 0,
    });
    expect(mockUpdate).toHaveBeenCalledWith("test-1", {
      status: "uploading",
      progress: 10,
    });
    expect(mockUpdate).toHaveBeenCalledWith("test-1", {
      status: "registering",
      progress: 95,
    });
    expect(mockUpdate).toHaveBeenCalledWith("test-1", {
      status: "complete",
      progress: 100,
    });
  });

  it("rejects video files smaller than 50KB", async () => {
    const tinyVideo = new File(["x"], "clip.mp4", { type: "video/mp4" });
    mockGetFile.mockResolvedValue(tinyVideo);

    await processUploadItem(
      makeItem({ fileName: "clip.mp4", fileType: "video/mp4" }),
      "wedding",
      "abc",
      refreshQueue,
    );

    expect(mockUpdate).toHaveBeenCalledWith("test-1", {
      status: "error",
      error: "Video too short to upload",
      retryCount: 1,
    });
  });

  it("increments retry count on error", async () => {
    mockGetFile.mockRejectedValue(new Error("Network error"));
    await processUploadItem(
      makeItem({ retryCount: 1 }),
      "wedding",
      "abc",
      refreshQueue,
    );

    expect(mockUpdate).toHaveBeenCalledWith("test-1", {
      status: "error",
      error: "Network error",
      retryCount: 2,
    });
  });
});
