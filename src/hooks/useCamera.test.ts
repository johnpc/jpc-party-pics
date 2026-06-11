import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useCamera } from "./useCamera";

const mockMutateAsync = vi.fn().mockResolvedValue({});
const mockUploadData = vi.fn().mockReturnValue({ result: Promise.resolve({}) });
const mockCompressMedia = vi.fn().mockResolvedValue({
  file: new File([], "compressed.jpg"),
  key: "public/album/hash/compressed.jpg",
});

const mockStop = vi.fn();
const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockGetUserMedia = vi.fn().mockResolvedValue({
  getTracks: () => [{ stop: mockStop }],
});

vi.mock("aws-amplify/storage", () => ({
  uploadData: (...args: unknown[]) => mockUploadData(...args),
}));

vi.mock("../helpers/compressMedia", () => ({
  compressMedia: (...args: unknown[]) => mockCompressMedia(...args),
}));

vi.mock("./useImages", () => ({
  useUploadImage: () => ({ mutateAsync: mockMutateAsync }),
}));

Object.defineProperty(navigator, "mediaDevices", {
  value: { getUserMedia: mockGetUserMedia },
  writable: true,
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useCamera", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLVideoElement.prototype.play = mockPlay;
  });

  it("initializes with idle state and photo mode", () => {
    const { result } = renderHook(() => useCamera("wedding"), {
      wrapper: createWrapper(),
    });

    expect(result.current.mode).toBe("photo");
    expect(result.current.streaming).toBe(false);
    expect(result.current.recording).toBe(false);
    expect(result.current.status).toBe("idle");
  });

  it("starts camera and sets streaming to true", async () => {
    const { result } = renderHook(() => useCamera("wedding"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.startCamera();
    });

    expect(mockGetUserMedia).toHaveBeenCalled();
    expect(result.current.streaming).toBe(true);
  });

  it("stops camera and sets streaming to false", async () => {
    const { result } = renderHook(() => useCamera("wedding"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.startCamera();
    });

    act(() => {
      result.current.stopCamera();
    });

    expect(mockStop).toHaveBeenCalled();
    expect(result.current.streaming).toBe(false);
  });

  it("switches mode between photo and video", () => {
    const { result } = renderHook(() => useCamera("wedding"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setMode("video");
    });
    expect(result.current.mode).toBe("video");

    act(() => {
      result.current.setMode("photo");
    });
    expect(result.current.mode).toBe("photo");
  });

  it("handles getUserMedia failure gracefully", async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error("Denied"));

    const { result } = renderHook(() => useCamera("wedding"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.startCamera();
    });

    expect(result.current.streaming).toBe(false);
  });

  it("capturePhoto does nothing when refs are null", async () => {
    const { result } = renderHook(() => useCamera("wedding"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.capturePhoto();
    });

    expect(mockCompressMedia).not.toHaveBeenCalled();
  });

  it("startRecording does nothing when stream is null", () => {
    const { result } = renderHook(() => useCamera("wedding"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.startRecording();
    });

    expect(result.current.recording).toBe(false);
  });

  it("stopRecording calls stop on mediaRecorder", async () => {
    const mockStart = vi.fn();
    const mockRecorderStop = vi.fn();

    const MockMediaRecorder = class {
      ondataavailable: ((e: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      start() {
        mockStart();
      }
      stop() {
        mockRecorderStop();
      }
      static isTypeSupported() {
        return false;
      }
    };
    vi.stubGlobal("MediaRecorder", MockMediaRecorder);

    const { result } = renderHook(() => useCamera("wedding"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.startCamera();
    });

    act(() => {
      result.current.startRecording();
    });

    expect(result.current.recording).toBe(true);
    expect(mockStart).toHaveBeenCalled();

    act(() => {
      result.current.stopRecording();
    });

    expect(mockRecorderStop).toHaveBeenCalled();
    expect(result.current.recording).toBe(false);
  });

  it("capturePhoto uploads when refs are available", async () => {
    const mockDrawImage = vi.fn();
    const mockGetContext = vi
      .fn()
      .mockReturnValue({ drawImage: mockDrawImage });
    const mockToBlob = vi.fn((cb: (blob: Blob | null) => void) => {
      cb(new Blob(["data"], { type: "image/jpeg" }));
    });

    const videoEl = document.createElement("video");
    Object.defineProperty(videoEl, "videoWidth", { value: 1920 });
    Object.defineProperty(videoEl, "videoHeight", { value: 1080 });

    const canvasEl = document.createElement("canvas");
    canvasEl.getContext =
      mockGetContext as unknown as typeof canvasEl.getContext;
    canvasEl.toBlob = mockToBlob as unknown as typeof canvasEl.toBlob;

    const { result } = renderHook(() => useCamera("wedding"), {
      wrapper: createWrapper(),
    });

    (result.current.videoRef as { current: HTMLVideoElement | null }).current =
      videoEl;
    (
      result.current.canvasRef as { current: HTMLCanvasElement | null }
    ).current = canvasEl;

    await act(async () => {
      await result.current.capturePhoto();
    });

    await waitFor(() => {
      expect(mockCompressMedia).toHaveBeenCalled();
      expect(mockUploadData).toHaveBeenCalled();
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  it("capturePhoto handles null blob", async () => {
    const mockGetContext = vi.fn().mockReturnValue({ drawImage: vi.fn() });
    const mockToBlob = vi.fn((cb: (blob: Blob | null) => void) => {
      cb(null);
    });

    const videoEl = document.createElement("video");
    Object.defineProperty(videoEl, "videoWidth", { value: 1920 });
    Object.defineProperty(videoEl, "videoHeight", { value: 1080 });

    const canvasEl = document.createElement("canvas");
    canvasEl.getContext =
      mockGetContext as unknown as typeof canvasEl.getContext;
    canvasEl.toBlob = mockToBlob as unknown as typeof canvasEl.toBlob;

    const { result } = renderHook(() => useCamera("wedding"), {
      wrapper: createWrapper(),
    });

    (result.current.videoRef as { current: HTMLVideoElement | null }).current =
      videoEl;
    (
      result.current.canvasRef as { current: HTMLCanvasElement | null }
    ).current = canvasEl;

    await act(async () => {
      await result.current.capturePhoto();
    });

    expect(mockCompressMedia).not.toHaveBeenCalled();
  });

  it("capturePhoto handles upload failure", async () => {
    mockUploadData.mockReturnValueOnce({
      result: Promise.reject(new Error("Upload failed")),
    });

    const mockGetContext = vi.fn().mockReturnValue({ drawImage: vi.fn() });
    const mockToBlob = vi.fn((cb: (blob: Blob | null) => void) => {
      cb(new Blob(["data"], { type: "image/jpeg" }));
    });

    const videoEl = document.createElement("video");
    Object.defineProperty(videoEl, "videoWidth", { value: 1920 });
    Object.defineProperty(videoEl, "videoHeight", { value: 1080 });

    const canvasEl = document.createElement("canvas");
    canvasEl.getContext =
      mockGetContext as unknown as typeof canvasEl.getContext;
    canvasEl.toBlob = mockToBlob as unknown as typeof canvasEl.toBlob;

    const { result } = renderHook(() => useCamera("wedding"), {
      wrapper: createWrapper(),
    });

    (result.current.videoRef as { current: HTMLVideoElement | null }).current =
      videoEl;
    (
      result.current.canvasRef as { current: HTMLCanvasElement | null }
    ).current = canvasEl;

    await act(async () => {
      await result.current.capturePhoto();
    });

    await waitFor(() => {
      expect(result.current.status).toBe("idle");
    });
  });

  it("recording onstop uploads video successfully", async () => {
    let capturedOnStop: (() => void) | null = null;
    let capturedOnData: ((e: { data: Blob }) => void) | null = null;

    const MockMediaRecorder = class {
      set ondataavailable(fn: ((e: { data: Blob }) => void) | null) {
        capturedOnData = fn;
      }
      set onstop(fn: (() => void) | null) {
        capturedOnStop = fn;
      }
      start() {}
      stop() {
        if (capturedOnData) capturedOnData({ data: new Blob(["video"]) });
        if (capturedOnStop) capturedOnStop();
      }
      static isTypeSupported() {
        return false;
      }
    };
    vi.stubGlobal("MediaRecorder", MockMediaRecorder);

    const { result } = renderHook(() => useCamera("wedding"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.startCamera();
    });

    act(() => {
      result.current.startRecording();
    });

    await act(async () => {
      result.current.stopRecording();
    });

    await waitFor(() => {
      expect(mockUploadData).toHaveBeenCalled();
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });
});
