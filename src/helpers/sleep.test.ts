import { describe, it, expect, vi } from "vitest";
import { sleep } from "./sleep";

describe("sleep", () => {
  it("resolves after the specified duration", async () => {
    vi.useFakeTimers();
    const promise = sleep(1000);
    vi.advanceTimersByTime(1000);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it("does not resolve before the specified duration", async () => {
    vi.useFakeTimers();
    let resolved = false;
    sleep(1000).then(() => {
      resolved = true;
    });
    vi.advanceTimersByTime(500);
    expect(resolved).toBe(false);
    vi.advanceTimersByTime(500);
    await Promise.resolve();
    expect(resolved).toBe(true);
    vi.useRealTimers();
  });
});
