import { describe, it, expect } from "vitest";
import {
  canCapture,
  formatBytes,
  idle,
  isRecording,
  recordedChunk,
  startRecording,
} from "./captureSession";

describe("captureSession", () => {
  it("starts recording at zero bytes and accumulates chunks", () => {
    const recording = startRecording();
    expect(recording).toEqual({ kind: "recording", bytes: 0 });
    expect(recordedChunk(recording, 1500)).toEqual({
      kind: "recording",
      bytes: 1500,
    });
    expect(recordedChunk(recordedChunk(recording, 10), 5)).toMatchObject({
      bytes: 15,
    });
  });

  it("ignores chunks outside the recording phase", () => {
    expect(recordedChunk(idle, 100)).toBe(idle);
    const uploading = { kind: "uploading" } as const;
    expect(recordedChunk(uploading, 100)).toBe(uploading);
  });

  it("allows capture controls only while idle or recording", () => {
    expect(canCapture(idle)).toBe(true);
    expect(canCapture(startRecording())).toBe(true);
    expect(canCapture({ kind: "uploading" })).toBe(false);
    expect(canCapture({ kind: "success" })).toBe(false);
  });

  it("knows when it is recording", () => {
    expect(isRecording(startRecording())).toBe(true);
    expect(isRecording(idle)).toBe(false);
  });

  it("formats bytes as whole kilobytes", () => {
    expect(formatBytes(0)).toBe("0 KB");
    expect(formatBytes(51_200)).toBe("50 KB");
    expect(formatBytes(1_500)).toBe("1 KB");
  });
});
