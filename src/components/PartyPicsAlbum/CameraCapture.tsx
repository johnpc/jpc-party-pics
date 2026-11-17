import { Button, Flex, Divider, useTheme } from "@aws-amplify/ui-react";
import { useCamera } from "../../hooks/useCamera";
import { ModeToggle } from "../Camera/ModeToggle";
import { CameraStatusAlert } from "../Camera/CameraStatusAlert";
import { CaptureControls } from "../Camera/CaptureControls";

export const CameraCapture = ({ albumName }: { albumName: string }) => {
  const { tokens } = useTheme();
  const cam = useCamera(albumName);

  if (!cam.streaming) {
    return (
      <Flex direction="column" gap="0.5rem" marginBottom={tokens.space.medium}>
        <Button onClick={cam.startCamera}>📷 Use Camera</Button>
        <CameraStatusAlert phase={cam.phase} stream={cam.stream} />
      </Flex>
    );
  }

  return (
    <>
      <Flex direction="column" gap="0.5rem" marginBottom={tokens.space.medium}>
        <Flex gap="0.5rem" justifyContent="space-between" alignItems="center">
          <ModeToggle mode={cam.mode} onSetMode={cam.setMode} />
          <Button onClick={cam.stopCamera} size="small" variation="link">
            Close
          </Button>
        </Flex>

        <video
          ref={cam.videoRef}
          style={{
            width: "100%",
            maxHeight: "400px",
            backgroundColor: "#000",
            borderRadius: tokens.radii.medium.value,
          }}
        />
        <canvas ref={cam.canvasRef} style={{ display: "none" }} />

        <CameraStatusAlert phase={cam.phase} />

        <CaptureControls
          mode={cam.mode}
          phase={cam.phase}
          onCapture={cam.capturePhoto}
          onStartRecording={cam.startRecording}
          onStopRecording={cam.stopRecording}
          size="small"
          photoLabel="📷 Capture Photo"
        />
      </Flex>
      <Divider marginBottom={tokens.space.medium} />
    </>
  );
};
