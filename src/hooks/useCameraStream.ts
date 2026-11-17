import { useRef, useState } from "react";

// @state-machine camera-stream
// off → live (getUserMedia resolved) | denied (it threw); live → off (stop).
export type StreamState = "off" | "live" | "denied";

export function useCameraStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<StreamState>("off");

  const startCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: true,
      });
      streamRef.current = media;
      if (videoRef.current) {
        videoRef.current.srcObject = media;
        videoRef.current.play();
      }
      setStream("live");
    } catch (error) {
      console.error("Camera access denied:", error);
      setStream("denied");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream("off");
  };

  return {
    videoRef,
    streamRef,
    stream,
    streaming: stream === "live",
    startCamera,
    stopCamera,
  };
}
