import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CaptureMode,
  CapturePhase,
  SUCCESS_FLASH_MS,
  idle,
  recordedChunk,
  startRecording as recordingPhase,
} from "../helpers/captureSession";
import {
  UploadContext,
  createRecorder,
  makeHash,
  processPhotoBlob,
} from "./cameraPipeline";
import { useUploadImage } from "./useImages";
import { useCameraStream } from "./useCameraStream";

// @state-machine capture-mode
// photo ⇄ video, user-selected; orthogonal to the capture phase.
export function useCamera(albumName: string) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const cameraStream = useCameraStream();
  const { videoRef, streamRef } = cameraStream;

  const [mode, setMode] = useState<CaptureMode>("photo");
  const [phase, setPhase] = useState<CapturePhase>(idle);
  const [hash] = useState(makeHash(5));

  // The success flash owns its timer: a new phase or an unmount cancels it,
  // so it can never knock a later upload back to idle.
  useEffect(() => {
    if (phase.kind !== "success") return;
    const timer = setTimeout(() => setPhase(idle), SUCCESS_FLASH_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const uploadImage = useUploadImage(albumName);
  const ctx = useMemo<UploadContext>(
    () => ({ albumName, hash, register: uploadImage.mutateAsync, setPhase }),
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
    const recorder = createRecorder(streamRef.current, ctx, (size) =>
      setPhase((p) => recordedChunk(p, size)),
    );
    mediaRecorderRef.current = recorder;
    recorder.start(1000);
    setPhase(recordingPhase());
  }, [streamRef, ctx]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.stop();
  }, []);

  return {
    videoRef,
    canvasRef,
    mode,
    setMode,
    stream: cameraStream.stream,
    streaming: cameraStream.streaming,
    phase,
    startCamera: cameraStream.startCamera,
    stopCamera: cameraStream.stopCamera,
    capturePhoto,
    startRecording,
    stopRecording,
  };
}
