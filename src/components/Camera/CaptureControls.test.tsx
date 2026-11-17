import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { CaptureControls } from "./CaptureControls";

vi.mock("@aws-amplify/ui-react", () => ({
  Button: ({
    children,
    onClick,
    isDisabled,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    isDisabled?: boolean;
    "data-recorded-bytes"?: number;
  }) => (
    <button
      onClick={onClick}
      disabled={isDisabled}
      data-recorded-bytes={rest["data-recorded-bytes"]}
    >
      {children}
    </button>
  ),
}));

describe("CaptureControls", () => {
  const baseProps = {
    phase: { kind: "idle" } as const,
    onCapture: vi.fn(),
    onStartRecording: vi.fn(),
    onStopRecording: vi.fn(),
  };

  it("renders capture button in photo mode", () => {
    renderWithProviders(<CaptureControls {...baseProps} mode="photo" />);
    expect(screen.getByText(/Capture/)).toBeInTheDocument();
  });

  it("renders start recording in video mode", () => {
    renderWithProviders(<CaptureControls {...baseProps} mode="video" />);
    expect(screen.getByText(/Start Recording/)).toBeInTheDocument();
  });

  it("renders stop recording when recording", () => {
    renderWithProviders(
      <CaptureControls
        {...baseProps}
        mode="video"
        phase={{ kind: "recording", bytes: 0 }}
      />,
    );
    expect(screen.getByText(/Stop Recording/)).toBeInTheDocument();
  });

  it("calls onCapture in photo mode", () => {
    const onCapture = vi.fn();
    renderWithProviders(
      <CaptureControls {...baseProps} mode="photo" onCapture={onCapture} />,
    );
    fireEvent.click(screen.getByText(/Capture/));
    expect(onCapture).toHaveBeenCalled();
  });

  it("calls onStartRecording in video mode", () => {
    const onStartRecording = vi.fn();
    renderWithProviders(
      <CaptureControls
        {...baseProps}
        mode="video"
        onStartRecording={onStartRecording}
      />,
    );
    fireEvent.click(screen.getByText(/Start Recording/));
    expect(onStartRecording).toHaveBeenCalled();
  });

  it("calls onStopRecording when recording", () => {
    const onStopRecording = vi.fn();
    renderWithProviders(
      <CaptureControls
        {...baseProps}
        mode="video"
        phase={{ kind: "recording", bytes: 2048 }}
        onStopRecording={onStopRecording}
      />,
    );
    fireEvent.click(screen.getByText(/Stop Recording/));
    expect(onStopRecording).toHaveBeenCalled();
  });

  it("disables button when not idle", () => {
    renderWithProviders(
      <CaptureControls
        {...baseProps}
        mode="photo"
        phase={{ kind: "uploading" }}
      />,
    );
    expect(screen.getByText(/Capture/)).toBeDisabled();
  });

  it("disables the record button while the flash of success shows", () => {
    renderWithProviders(
      <CaptureControls
        {...baseProps}
        mode="video"
        phase={{ kind: "success" }}
      />,
    );
    expect(screen.getByText(/Start Recording/)).toBeDisabled();
  });

  it("exposes the recorded byte count while recording", () => {
    renderWithProviders(
      <CaptureControls
        {...baseProps}
        mode="video"
        phase={{ kind: "recording", bytes: 4096 }}
      />,
    );
    expect(screen.getByText(/Stop Recording/)).toHaveAttribute(
      "data-recorded-bytes",
      "4096",
    );
  });

  it("uses custom photo label", () => {
    renderWithProviders(
      <CaptureControls {...baseProps} mode="photo" photoLabel="Take Photo" />,
    );
    expect(screen.getByText("Take Photo")).toBeInTheDocument();
  });

  it("disables controls until the camera stream is live", () => {
    renderWithProviders(
      <CaptureControls {...baseProps} mode="video" streamLive={false} />,
    );
    expect(screen.getByText(/Start Recording/)).toBeDisabled();
  });
});
