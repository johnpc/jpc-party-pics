import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUploadQueue } from "./useUploadQueue";

vi.mock("aws-amplify/storage", () => ({
  uploadData: vi.fn(() => ({
    result: Promise.resolve({ path: "public/wedding/abc/test-photo.jpg" }),
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

vi.mock("../helpers/fileCache", () => ({
  cacheFile: vi.fn().mockResolvedValue(undefined),
  getFileFromCache: vi.fn().mockResolvedValue(null),
}));

vi.mock("./useUploadProcessor", () => ({
  processUploadItem: vi.fn().mockResolvedValue(undefined),
}));

const mockAddToQueue = vi.fn().mockResolvedValue(undefined);
const mockGetAllQueued = vi.fn().mockResolvedValue([]);
const mockUpdateQueueItem = vi.fn().mockResolvedValue(undefined);

vi.mock("../helpers/uploadQueue", () => ({
  getAllQueued: (...args: unknown[]) => mockGetAllQueued(...args),
  addToQueue: (...args: unknown[]) => mockAddToQueue(...args),
  updateQueueItem: (...args: unknown[]) => mockUpdateQueueItem(...args),
  removeFromQueue: vi.fn().mockResolvedValue(undefined),
  clearCompleted: vi.fn().mockResolvedValue(undefined),
}));

describe("useUploadQueue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllQueued.mockResolvedValue([]);
  });

  it("starts with empty queue", async () => {
    const { result } = renderHook(() => useUploadQueue("wedding"));
    await act(async () => {});
    expect(result.current.queue).toEqual([]);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.activeCount).toBe(0);
    expect(result.current.errorCount).toBe(0);
  });

  it("addFiles queues files for upload", async () => {
    const { result } = renderHook(() => useUploadQueue("wedding"));
    const file = new File(["hello"], "test.jpg", { type: "image/jpeg" });

    await act(async () => {
      await result.current.addFiles([file]);
    });

    expect(mockAddToQueue).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: "test.jpg",
        fileSize: 5,
        fileType: "image/jpeg",
        albumName: "wedding",
        status: "pending",
      }),
    );
  });

  it("addFiles queues multiple files", async () => {
    const { result } = renderHook(() => useUploadQueue("wedding"));
    const files = [
      new File(["a"], "a.jpg", { type: "image/jpeg" }),
      new File(["b"], "b.jpg", { type: "image/jpeg" }),
    ];

    await act(async () => {
      await result.current.addFiles(files);
    });

    expect(mockAddToQueue).toHaveBeenCalledTimes(2);
  });

  it("exposes error count from queue state", async () => {
    mockGetAllQueued.mockResolvedValue([
      {
        id: "err-1",
        fileName: "bad.jpg",
        fileSize: 100,
        fileType: "image/jpeg",
        albumName: "wedding",
        status: "error",
        progress: 0,
        retryCount: 1,
        addedAt: Date.now(),
        error: "fail",
      },
    ]);

    const { result } = renderHook(() => useUploadQueue("wedding"));
    await act(async () => {});
    expect(result.current.errorCount).toBe(1);
  });

  it("retryFailed resets error items to pending", async () => {
    mockGetAllQueued.mockResolvedValue([
      {
        id: "err-1",
        fileName: "bad.jpg",
        fileSize: 100,
        fileType: "image/jpeg",
        albumName: "wedding",
        status: "error",
        progress: 0,
        retryCount: 1,
        addedAt: Date.now(),
        error: "fail",
      },
    ]);

    const { result } = renderHook(() => useUploadQueue("wedding"));
    await act(async () => {});

    await act(async () => {
      await result.current.retryFailed();
    });

    expect(mockUpdateQueueItem).toHaveBeenCalledWith("err-1", {
      status: "pending",
    });
  });

  it("filters queue to current album only", async () => {
    mockGetAllQueued.mockResolvedValue([
      {
        id: "a-1",
        fileName: "mine.jpg",
        fileSize: 100,
        fileType: "image/jpeg",
        albumName: "wedding",
        status: "uploading",
        progress: 50,
        retryCount: 0,
        addedAt: Date.now(),
      },
      {
        id: "b-1",
        fileName: "other.jpg",
        fileSize: 100,
        fileType: "image/jpeg",
        albumName: "birthday",
        status: "uploading",
        progress: 50,
        retryCount: 0,
        addedAt: Date.now(),
      },
    ]);

    const { result } = renderHook(() => useUploadQueue("wedding"));
    await act(async () => {});
    expect(result.current.queue).toHaveLength(1);
    expect(result.current.queue[0].id).toBe("a-1");
  });

  it("does not retry items exceeding max retries", async () => {
    mockGetAllQueued.mockResolvedValue([
      {
        id: "err-max",
        fileName: "bad.jpg",
        fileSize: 100,
        fileType: "image/jpeg",
        albumName: "wedding",
        status: "error",
        progress: 0,
        retryCount: 3,
        addedAt: Date.now(),
        error: "too many retries",
      },
    ]);

    const { result } = renderHook(() => useUploadQueue("wedding"));
    await act(async () => {});

    await act(async () => {
      await result.current.retryFailed();
    });

    expect(mockUpdateQueueItem).not.toHaveBeenCalled();
  });
});
