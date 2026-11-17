import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTransientFlag } from "./useTransientFlag";

describe("useTransientFlag", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is off until triggered, then clears after the duration", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTransientFlag(1000));
    expect(result.current[0]).toBe(false);

    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);

    act(() => vi.advanceTimersByTime(999));
    expect(result.current[0]).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current[0]).toBe(false);
  });

  it("re-triggering restarts the timer instead of racing it", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTransientFlag(1000));
    act(() => result.current[1]());
    act(() => vi.advanceTimersByTime(800));
    act(() => result.current[1]());
    act(() => vi.advanceTimersByTime(800));
    // 1600 ms after the first trigger but only 800 after the second: still on
    expect(result.current[0]).toBe(true);
    act(() => vi.advanceTimersByTime(200));
    expect(result.current[0]).toBe(false);
  });

  it("cancels the timer on unmount", () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useTransientFlag(1000));
    act(() => result.current[1]());
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
