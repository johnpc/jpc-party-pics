import { Alert } from "@aws-amplify/ui-react";
import { CapturePhase, formatBytes } from "../../helpers/captureSession";
import { StreamState } from "../../hooks/useCameraStream";

export const CameraStatusAlert = ({
  phase,
  stream,
}: {
  phase: CapturePhase;
  stream?: StreamState;
}) => {
  if (stream === "denied")
    return (
      <Alert variation="error">
        Camera access was denied. Allow camera permission for this site and try
        again.
      </Alert>
    );
  if (phase.kind === "recording")
    return (
      <Alert variation="info">
        Recording... {formatBytes(phase.bytes)} captured
      </Alert>
    );
  if (phase.kind === "uploading")
    return <Alert variation="info">Uploading...</Alert>;
  if (phase.kind === "success")
    return <Alert variation="success">Success!</Alert>;
  return null;
};
