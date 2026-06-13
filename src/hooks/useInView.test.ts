import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useInView } from "./useInView";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor() {}
      observe = vi.fn();
      disconnect = vi.fn();
    },
  );
});

describe("useInView", () => {
  it("returns inView false initially", () => {
    const { result } = renderHook(() => useInView());
    expect(result.current.inView).toBe(false);
  });

  it("returns a ref object", () => {
    const { result } = renderHook(() => useInView());
    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull();
  });

  it("accepts custom rootMargin", () => {
    const { result } = renderHook(() => useInView("500px"));
    expect(result.current.inView).toBe(false);
  });
});
