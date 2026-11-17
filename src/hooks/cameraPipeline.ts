import {
  uploadPhoto,
  uploadVideo,
  isVideoTooShort,
} from "../helpers/cameraUpload";
import { CapturePhase, idle } from "../helpers/captureSession";

// The camera's capture → upload pipeline, kept out of the hook so useCamera.ts
// only owns state and wiring. Every function here reports back through
// ctx.setPhase — the capture-session machine's single writer.
export interface UploadContext {
  albumName: string;
  hash: string;
  register: (key: string) => Promise<unknown>;
  setPhase: (phase: CapturePhase) => void;
}

export function makeHash(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function selectMimeType(): { mimeType: string; ext: string } {
  const mimeType = MediaRecorder.isTypeSupported("video/mp4")
    ? "video/mp4"
    : "video/webm";
  return { mimeType, ext: mimeType === "video/mp4" ? "mp4" : "webm" };
}

// Wires a MediaRecorder so every non-empty chunk is counted into the recording
// phase and the stop event hands the chunks to the upload pipeline.
export function createRecorder(
  stream: MediaStream,
  ctx: UploadContext,
  onChunk: (size: number) => void,
): MediaRecorder {
  const { mimeType, ext } = selectMimeType();
  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, { mimeType });
  recorder.ondataavailable = (e) => {
    if (e.data.size === 0) return;
    chunks.push(e.data);
    onChunk(e.data.size);
  };
  recorder.onstop = () => processVideoChunks([...chunks], mimeType, ext, ctx);
  return recorder;
}

async function uploadCapture(
  ctx: UploadContext,
  upload: () => Promise<string>,
): Promise<void> {
  ctx.setPhase({ kind: "uploading" });
  try {
    const key = await upload();
    await ctx.register(key);
    ctx.setPhase({ kind: "success" });
  } catch (error) {
    console.error("Upload failed:", error);
    ctx.setPhase(idle);
  }
}

export function processPhotoBlob(blob: Blob | null, ctx: UploadContext): void {
  if (!blob) return;
  uploadCapture(ctx, () => uploadPhoto(blob, ctx.albumName, ctx.hash));
}

function processVideoChunks(
  chunks: Blob[],
  mimeType: string,
  ext: string,
  ctx: UploadContext,
): void {
  const blob = new Blob(chunks, { type: mimeType });
  if (isVideoTooShort(blob)) {
    console.warn(`Recording too short (${blob.size} bytes), discarding`);
    ctx.setPhase(idle);
    return;
  }
  uploadCapture(ctx, () =>
    uploadVideo(blob, mimeType, ext, ctx.albumName, ctx.hash),
  );
}
