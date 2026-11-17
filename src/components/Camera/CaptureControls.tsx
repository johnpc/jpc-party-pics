import { Button } from "@aws-amplify/ui-react";
import {
  CaptureMode,
  CapturePhase,
  canCapture,
  isRecording,
} from "../../helpers/captureSession";

interface CaptureControlsProps {
  mode: CaptureMode;
  phase: CapturePhase;
  onCapture: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  /** False until getUserMedia has resolved; nothing can be captured before. */
  streamLive?: boolean;
  size?: "small" | "large";
  photoLabel?: string;
}

export const CaptureControls = ({
  mode,
  phase,
  onCapture,
  onStartRecording,
  onStopRecording,
  streamLive = true,
  size = "large",
  photoLabel = "📷 Capture",
}: CaptureControlsProps) => {
  const disabled = !streamLive || !canCapture(phase);

  if (mode === "photo") {
    return (
      <Button
        onClick={onCapture}
        isDisabled={disabled}
        size={size}
        variation="primary"
      >
        {photoLabel}
      </Button>
    );
  }

  const recording = isRecording(phase);
  return (
    <Button
      onClick={recording ? onStopRecording : onStartRecording}
      isDisabled={disabled}
      size={size}
      variation={recording ? "warning" : "primary"}
      data-recorded-bytes={phase.kind === "recording" ? phase.bytes : undefined}
    >
      {recording ? "⏹ Stop Recording" : "⏺ Start Recording"}
    </Button>
  );
};
