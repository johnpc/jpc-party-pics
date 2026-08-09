import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useImageZoom } from "./useImageZoom";

function touch(x: number, y: number) {
  return {
    touches: [{ clientX: x, clientY: y }],
    stopPropagation: vi.fn(),
  } as unknown as React.TouchEvent;
}

let now = 1000;

beforeEach(() => {
  now = 1000;
  vi.spyOn(Date, "now").mockImplementation(() => now);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useImageZoom", () => {
  it("starts not zoomed", () => {
    const { result } = renderHook(() => useImageZoom());
    expect(result.current.zoomed).toBe(false);
    expect(result.current.style.transform).toContain("scale(1)");
  });

  it("zooms in on double click", () => {
    const { result } = renderHook(() => useImageZoom());
    act(() => result.current.onDoubleClick());
    expect(result.current.zoomed).toBe(true);
    expect(result.current.style.transform).toContain("scale(2.5)");
  });

  it("toggles back out on second double click", () => {
    const { result } = renderHook(() => useImageZoom());
    act(() => result.current.onDoubleClick());
    act(() => result.current.onDoubleClick());
    expect(result.current.zoomed).toBe(false);
  });

  it("zooms in on a fast double tap", () => {
    const { result } = renderHook(() => useImageZoom());
    act(() => result.current.onTouchEnd(touch(0, 0)));
    now += 100;
    act(() => result.current.onTouchEnd(touch(0, 0)));
    expect(result.current.zoomed).toBe(true);
  });

  it("does not zoom on two slow taps", () => {
    const { result } = renderHook(() => useImageZoom());
    act(() => result.current.onTouchEnd(touch(0, 0)));
    now += 500;
    act(() => result.current.onTouchEnd(touch(0, 0)));
    expect(result.current.zoomed).toBe(false);
  });

  it("stays zoomed when a ghost dblclick follows a touch double tap", () => {
    // Real mobile: a touch double-tap toggles zoom, then the browser fires a
    // synthesized dblclick. That ghost click must NOT undo the zoom.
    const { result } = renderHook(() => useImageZoom());
    act(() => result.current.onTouchEnd(touch(0, 0)));
    now += 100;
    act(() => result.current.onTouchEnd(touch(0, 0)));
    expect(result.current.zoomed).toBe(true);
    now += 50; // synthesized dblclick lands right after
    act(() => result.current.onDoubleClick());
    expect(result.current.zoomed).toBe(true);
  });

  it("un-zooms on a genuine second touch double tap", () => {
    const { result } = renderHook(() => useImageZoom());
    act(() => result.current.onTouchEnd(touch(0, 0)));
    now += 100;
    act(() => result.current.onTouchEnd(touch(0, 0)));
    expect(result.current.zoomed).toBe(true);
    now += 1000; // well past the ghost-click window
    act(() => result.current.onTouchEnd(touch(0, 0)));
    now += 100;
    act(() => result.current.onTouchEnd(touch(0, 0)));
    expect(result.current.zoomed).toBe(false);
  });

  it("pans while zoomed", () => {
    const { result } = renderHook(() => useImageZoom());
    act(() => result.current.onDoubleClick());
    act(() => result.current.onTouchStart(touch(100, 100)));
    act(() => result.current.onTouchMove(touch(150, 130)));
    expect(result.current.style.transform).toContain("translate(50px, 30px)");
  });

  it("ignores drag when not zoomed", () => {
    const { result } = renderHook(() => useImageZoom());
    act(() => result.current.onTouchStart(touch(100, 100)));
    act(() => result.current.onTouchMove(touch(150, 130)));
    expect(result.current.style.transform).toContain("translate(0px, 0px)");
  });

  it("resets pan offset when toggling zoom off", () => {
    const { result } = renderHook(() => useImageZoom());
    act(() => result.current.onDoubleClick());
    act(() => result.current.onTouchStart(touch(100, 100)));
    act(() => result.current.onTouchMove(touch(150, 130)));
    act(() => result.current.onDoubleClick());
    expect(result.current.style.transform).toContain("translate(0px, 0px)");
  });
});
