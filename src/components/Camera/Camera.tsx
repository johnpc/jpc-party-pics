import { Button, Flex, useTheme } from "@aws-amplify/ui-react";
import { useEffect } from "react";
import { useCamera } from "../../hooks/useCamera";
import { ModeToggle } from "./ModeToggle";
import { CameraStatusAlert } from "./CameraStatusAlert";
import { CaptureControls } from "./CaptureControls";

export const Camera = ({ albumName }: { albumName: string }) => {
  const { tokens } = useTheme();
  const cam = useCamera(albumName);

  useEffect(() => {
    cam.startCamera();
    return () => cam.stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex direction="column" gap="1rem" padding={tokens.space.medium}>
      <Flex justifyContent="space-between">
        <Button
          onClick={() => (window.location.href = `/${albumName}`)}
          size="small"
        >
          ← Back
        </Button>
        <ModeToggle mode={cam.mode} onSetMode={cam.setMode} />
      </Flex>

      <video
        ref={cam.videoRef}
        style={{
          width: "100%",
          maxHeight: "70vh",
          backgroundColor: "#000",
          borderRadius: tokens.radii.medium.value,
        }}
      />
      <canvas ref={cam.canvasRef} style={{ display: "none" }} />

      <CameraStatusAlert status={cam.status} />

      <Flex justifyContent="center" gap="1rem">
        <CaptureControls
          mode={cam.mode}
          status={cam.status}
          recording={cam.recording}
          onCapture={cam.capturePhoto}
          onStartRecording={cam.startRecording}
          onStopRecording={cam.stopRecording}
        />
      </Flex>
    </Flex>
  );
};
