import { describe, it, expect } from "vitest";
import { QueuedUpload } from "./uploadQueue";
import {
  MAX_RETRIES,
  isActive,
  isExhausted,
  isFailed,
  isProcessable,
  isRetryable,
  statusLabel,
  toComplete,
  toCompressing,
  toError,
  toPending,
  toRegistering,
  toUploading,
  uploadProgress,
} from "./uploadItemState";

const item = (overrides: Partial<QueuedUpload> = {}): QueuedUpload => ({
  id: "1",
  fileName: "a.jpg",
  fileSize: 1,
  fileType: "image/jpeg",
  albumName: "wedding",
  status: "pending",
  progress: 0,
  retryCount: 0,
  addedAt: 0,
  ...overrides,
});

describe("uploadItemState transitions", () => {
  it("pins the progress each phase starts at", () => {
    expect(toCompressing()).toEqual({ status: "compressing", progress: 0 });
    expect(toUploading()).toEqual({ status: "uploading", progress: 10 });
    expect(toRegistering()).toEqual({ status: "registering", progress: 95 });
    expect(toComplete()).toEqual({ status: "complete", progress: 100 });
    expect(toPending()).toEqual({ status: "pending" });
  });

  it("error increments the retry budget and records the message", () => {
    expect(toError(item({ retryCount: 1 }), "boom")).toEqual({
      status: "error",
      error: "boom",
      retryCount: 2,
    });
  });

  it("maps transferred bytes onto the 10-90 band", () => {
    expect(uploadProgress(0, 100)).toBe(10);
    expect(uploadProgress(50, 100)).toBe(50);
    expect(uploadProgress(100, 100)).toBe(90);
    expect(uploadProgress(5, undefined)).toBe(10);
    expect(uploadProgress(5, 0)).toBe(10);
  });
});

describe("uploadItemState classifiers", () => {
  it("active = anything still moving", () => {
    expect(isActive(item({ status: "pending" }))).toBe(true);
    expect(isActive(item({ status: "uploading" }))).toBe(true);
    expect(isActive(item({ status: "complete" }))).toBe(false);
    expect(isActive(item({ status: "error" }))).toBe(false);
  });

  it("splits failures into retryable and exhausted", () => {
    const retryable = item({ status: "error", retryCount: MAX_RETRIES - 1 });
    const exhausted = item({ status: "error", retryCount: MAX_RETRIES });
    expect(isFailed(retryable)).toBe(true);
    expect(isRetryable(retryable)).toBe(true);
    expect(isExhausted(retryable)).toBe(false);
    expect(isRetryable(exhausted)).toBe(false);
    expect(isExhausted(exhausted)).toBe(true);
    expect(isRetryable(item({ status: "uploading" }))).toBe(false);
  });

  it("processable = pending or retryable, never in-flight phases", () => {
    expect(isProcessable(item())).toBe(true);
    expect(isProcessable(item({ status: "error", retryCount: 1 }))).toBe(true);
    expect(isProcessable(item({ status: "error", retryCount: 3 }))).toBe(false);
    expect(isProcessable(item({ status: "compressing" }))).toBe(false);
    expect(isProcessable(item({ status: "complete" }))).toBe(false);
  });

  it("labels every status, distinguishing a spent retry budget", () => {
    expect(statusLabel(item({ status: "pending" }))).toBe("Waiting...");
    expect(statusLabel(item({ status: "compressing" }))).toBe("Compressing...");
    expect(statusLabel(item({ status: "uploading" }))).toBe("Uploading...");
    expect(statusLabel(item({ status: "registering" }))).toBe("Finishing...");
    expect(statusLabel(item({ status: "complete" }))).toBe("Done!");
    expect(statusLabel(item({ status: "error", retryCount: 1 }))).toBe(
      "Failed",
    );
    expect(statusLabel(item({ status: "error", retryCount: 3 }))).toBe(
      "Failed (gave up)",
    );
  });
});
