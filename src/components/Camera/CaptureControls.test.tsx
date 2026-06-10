import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { CaptureControls } from "./CaptureControls";

vi.mock("@aws-amplify/ui-react", () => ({
  Button: ({
    children,
    onClick,
    isDisabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    isDisabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={isDisabled}>
      {children}
    </button>
  ),
}));

describe("CaptureControls", () => {
  const baseProps = {
    status: "idle",
    recording: false,
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
      <CaptureControls {...baseProps} mode="video" recording={true} />,
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
        recording={true}
        onStopRecording={onStopRecording}
      />,
    );
    fireEvent.click(screen.getByText(/Stop Recording/));
    expect(onStopRecording).toHaveBeenCalled();
  });

  it("disables button when not idle", () => {
    renderWithProviders(
      <CaptureControls {...baseProps} mode="photo" status="uploading" />,
    );
    expect(screen.getByText(/Capture/)).toBeDisabled();
  });

  it("uses custom photo label", () => {
    renderWithProviders(
      <CaptureControls {...baseProps} mode="photo" photoLabel="Take Photo" />,
    );
    expect(screen.getByText("Take Photo")).toBeInTheDocument();
  });
});
