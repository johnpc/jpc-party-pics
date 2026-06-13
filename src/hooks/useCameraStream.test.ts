import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCameraStream } from "./useCameraStream";

const mockStop = vi.fn();
const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockGetUserMedia = vi.fn().mockResolvedValue({
  getTracks: () => [{ stop: mockStop }],
});

Object.defineProperty(navigator, "mediaDevices", {
  value: { getUserMedia: mockGetUserMedia },
  writable: true,
});

describe("useCameraStream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLVideoElement.prototype.play = mockPlay;
  });

  it("starts with streaming false", () => {
    const { result } = renderHook(() => useCameraStream());
    expect(result.current.streaming).toBe(false);
  });

  it("starts camera and sets streaming true", async () => {
    const { result } = renderHook(() => useCameraStream());

    await act(async () => {
      await result.current.startCamera();
    });

    expect(mockGetUserMedia).toHaveBeenCalled();
    expect(result.current.streaming).toBe(true);
  });

  it("stops camera and sets streaming false", async () => {
    const { result } = renderHook(() => useCameraStream());

    await act(async () => {
      await result.current.startCamera();
    });

    act(() => {
      result.current.stopCamera();
    });

    expect(mockStop).toHaveBeenCalled();
    expect(result.current.streaming).toBe(false);
  });

  it("handles getUserMedia failure gracefully", async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error("Denied"));
    const { result } = renderHook(() => useCameraStream());

    await act(async () => {
      await result.current.startCamera();
    });

    expect(result.current.streaming).toBe(false);
  });
});
