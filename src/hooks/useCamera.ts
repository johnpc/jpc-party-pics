import { useCallback, useMemo, useRef, useState } from "react";
import {
  uploadPhoto,
  uploadVideo,
  isVideoTooShort,
} from "../helpers/cameraUpload";
import { useUploadImage } from "./useImages";
import { useCameraStream } from "./useCameraStream";

type Mode = "photo" | "video";
type Status = "idle" | "uploading" | "success";

function makeHash(length: number): string {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function selectMimeType(): { mimeType: string; ext: string } {
  const mimeType = MediaRecorder.isTypeSupported("video/mp4")
    ? "video/mp4"
    : "video/webm";
  const ext = mimeType === "video/mp4" ? "mp4" : "webm";
  return { mimeType, ext };
}

interface UploadContext {
  albumName: string;
  hash: string;
  register: (key: string) => Promise<unknown>;
  setStatus: (s: Status) => void;
}

async function processPhotoBlob(
  blob: Blob | null,
  ctx: UploadContext,
): Promise<void> {
  if (!blob) return;
  ctx.setStatus("uploading");
  try {
    const key = await uploadPhoto(blob, ctx.albumName, ctx.hash);
    await ctx.register(key);
    ctx.setStatus("success");
    setTimeout(() => ctx.setStatus("idle"), 1500);
  } catch (error) {
    console.error("Upload failed:", error);
    ctx.setStatus("idle");
  }
}

async function processVideoChunks(
  chunks: Blob[],
  mimeType: string,
  ext: string,
  ctx: UploadContext,
): Promise<void> {
  const blob = new Blob(chunks, { type: mimeType });
  if (isVideoTooShort(blob)) {
    console.warn(`Recording too short (${blob.size} bytes), discarding`);
    ctx.setStatus("idle");
    return;
  }
  ctx.setStatus("uploading");
  try {
    const key = await uploadVideo(blob, mimeType, ext, ctx.albumName, ctx.hash);
    await ctx.register(key);
    ctx.setStatus("success");
    setTimeout(() => ctx.setStatus("idle"), 1500);
  } catch (error) {
    console.error("Upload failed:", error);
    ctx.setStatus("idle");
  }
}

export function useCamera(albumName: string) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { videoRef, streamRef, streaming, startCamera, stopCamera } =
    useCameraStream();

  const [mode, setMode] = useState<Mode>("photo");
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [hash] = useState(makeHash(5));

  const uploadImage = useUploadImage(albumName);

  const ctx = useMemo<UploadContext>(
    () => ({
      albumName,
      hash,
      register: uploadImage.mutateAsync,
      setStatus,
    }),
    [albumName, hash, uploadImage.mutateAsync],
  );

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => processPhotoBlob(blob, ctx), "image/jpeg", 0.95);
  }, [videoRef, canvasRef, ctx]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    const { mimeType, ext } = selectMimeType();
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      processVideoChunks([...chunksRef.current], mimeType, ext, ctx);
    };
    mediaRecorder.start(1000);
    setRecording(true);
  }, [streamRef, ctx]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.stop();
    setRecording(false);
  }, []);

  return {
    videoRef,
    canvasRef,
    mode,
    setMode,
    streaming,
    recording,
    status,
    startCamera,
    stopCamera,
    capturePhoto,
    startRecording,
    stopRecording,
  };
}
