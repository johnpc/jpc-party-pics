// @state-machine capture-session
// The in-app camera's capture lifecycle. Exactly one phase at a time; the
// buttons and alerts derive from it. Mode (photo/video) is orthogonal config
// and the stream (off/live/denied) is owned by useCameraStream.
export type CaptureMode = "photo" | "video";

export type CapturePhase =
  | { kind: "idle" }
  | { kind: "recording"; bytes: number }
  | { kind: "uploading" }
  | { kind: "success" };

export const SUCCESS_FLASH_MS = 1500;

export const idle: CapturePhase = { kind: "idle" };

export function startRecording(): CapturePhase {
  return { kind: "recording", bytes: 0 };
}

export function recordedChunk(phase: CapturePhase, size: number): CapturePhase {
  if (phase.kind !== "recording") return phase;
  return { kind: "recording", bytes: phase.bytes + size };
}

export function isRecording(phase: CapturePhase): boolean {
  return phase.kind === "recording";
}

/** Capture/record controls are usable only while nothing is in flight. */
export function canCapture(phase: CapturePhase): boolean {
  return phase.kind === "idle" || phase.kind === "recording";
}

export function formatBytes(bytes: number): string {
  return `${Math.round(bytes / 1024)} KB`;
}
