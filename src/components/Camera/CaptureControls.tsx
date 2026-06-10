import { Button } from "@aws-amplify/ui-react";

interface CaptureControlsProps {
  mode: "photo" | "video";
  status: string;
  recording: boolean;
  onCapture: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  size?: "small" | "large";
  photoLabel?: string;
}

export const CaptureControls = ({
  mode,
  status,
  recording,
  onCapture,
  onStartRecording,
  onStopRecording,
  size = "large",
  photoLabel = "📷 Capture",
}: CaptureControlsProps) => {
  if (mode === "photo") {
    return (
      <Button
        onClick={onCapture}
        isDisabled={status !== "idle"}
        size={size}
        variation="primary"
      >
        {photoLabel}
      </Button>
    );
  }

  return (
    <Button
      onClick={recording ? onStopRecording : onStartRecording}
      isDisabled={status !== "idle"}
      size={size}
      variation={recording ? "warning" : "primary"}
    >
      {recording ? "⏹ Stop Recording" : "⏺ Start Recording"}
    </Button>
  );
};
