import { Button, Flex, useTheme, Alert } from "@aws-amplify/ui-react";
import { useRef, useState, useEffect } from "react";
import { uploadData } from "aws-amplify/storage";
import { compressMedia } from "../../helpers/compressMedia";
import { useUploadImage } from "../../hooks/useImages";

const makeHash = (length: number): string => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

type Mode = "photo" | "video";
type Status = "idle" | "uploading" | "success";

export const Camera = ({ albumName }: { albumName: string }) => {
  const { tokens } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [mode, setMode] = useState<Mode>("photo");
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [hash] = useState(makeHash(5));
  const uploadImage = useUploadImage(albumName);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: mode === "video",
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Camera access denied:", error);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      setStatus("uploading");
      try {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        const { file: compressed, key } = await compressMedia({
          file,
          key: `public/${albumName}/${hash}/${file.name}`,
        });

        await uploadData({
          path: key,
          data: compressed,
          options: { useAccelerateEndpoint: true },
        }).result;

        await uploadImage.mutateAsync(key);
        setStatus("success");
        setTimeout(() => setStatus("idle"), 1500);
      } catch (error) {
        console.error("Upload failed:", error);
        setStatus("idle");
      }
    }, "image/jpeg", 0.95);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setStatus("uploading");

      try {
        const file = new File([blob], `video-${Date.now()}.webm`, { type: "video/webm" });
        const key = `public/${albumName}/${hash}/${file.name}`;

        await uploadData({
          path: key,
          data: file,
          options: { useAccelerateEndpoint: true },
        }).result;

        await uploadImage.mutateAsync(key);
        setStatus("success");
        setTimeout(() => setStatus("idle"), 1500);
      } catch (error) {
        console.error("Upload failed:", error);
        setStatus("idle");
      }
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <Flex direction="column" gap="1rem" padding={tokens.space.medium}>
      <Flex justifyContent="space-between">
        <Button onClick={() => window.location.href = `/${albumName}`} size="small">← Back</Button>
        <Flex gap="0.5rem">
          <Button
            variation={mode === "photo" ? "primary" : "link"}
            onClick={() => setMode("photo")}
            size="small"
          >
            Photo
          </Button>
          <Button
            variation={mode === "video" ? "primary" : "link"}
            onClick={() => setMode("video")}
            size="small"
          >
            Video
          </Button>
        </Flex>
      </Flex>

      <video
        ref={videoRef}
        style={{
          width: "100%",
          maxHeight: "70vh",
          backgroundColor: "#000",
          borderRadius: tokens.radii.medium.value,
        }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {status === "uploading" && <Alert variation="info">Uploading...</Alert>}
      {status === "success" && <Alert variation="success">Success!</Alert>}

      <Flex justifyContent="center" gap="1rem">
        {mode === "photo" ? (
          <Button
            onClick={capturePhoto}
            isDisabled={status !== "idle"}
            size="large"
            variation="primary"
          >
            📷 Capture
          </Button>
        ) : (
          <Button
            onClick={recording ? stopRecording : startRecording}
            isDisabled={status !== "idle"}
            size="large"
            variation={recording ? "warning" : "primary"}
          >
            {recording ? "⏹ Stop" : "⏺ Record"}
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
