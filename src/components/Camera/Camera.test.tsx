import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { Camera } from "./Camera";

const mockStartCamera = vi.fn();
const mockStopCamera = vi.fn();
const mockCapturePhoto = vi.fn();
const mockStartRecording = vi.fn();
const mockStopRecording = vi.fn();
const mockSetMode = vi.fn();

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
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Alert: ({
    children,
    variation,
  }: {
    children: React.ReactNode;
    variation: string;
  }) => <div data-testid={`alert-${variation}`}>{children}</div>,
  useTheme: () => ({
    tokens: {
      space: { medium: { value: "8px" } },
      radii: { medium: { value: "4px" } },
    },
  }),
}));

vi.mock("../../hooks/useCamera", () => ({
  useCamera: () => ({
    videoRef: { current: null },
    canvasRef: { current: null },
    mode: "photo",
    setMode: mockSetMode,
    streaming: true,
    recording: false,
    status: "idle",
    startCamera: mockStartCamera,
    stopCamera: mockStopCamera,
    capturePhoto: mockCapturePhoto,
    startRecording: mockStartRecording,
    stopRecording: mockStopRecording,
  }),
}));

describe("Camera", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: { href: "/wedding/camera" },
      writable: true,
    });
  });

  it("calls startCamera on mount", () => {
    renderWithProviders(<Camera albumName="wedding" />);
    expect(mockStartCamera).toHaveBeenCalled();
  });

  it("renders photo and video mode buttons", () => {
    renderWithProviders(<Camera albumName="wedding" />);
    expect(screen.getByText("Photo")).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument();
  });

  it("renders back button that navigates to album", () => {
    renderWithProviders(<Camera albumName="wedding" />);
    fireEvent.click(screen.getByText(/Back/));
    expect(window.location.href).toBe("/wedding");
  });

  it("renders capture button in photo mode", () => {
    renderWithProviders(<Camera albumName="wedding" />);
    expect(screen.getByText(/Capture/)).toBeInTheDocument();
  });

  it("calls capturePhoto when capture button clicked", () => {
    renderWithProviders(<Camera albumName="wedding" />);
    fireEvent.click(screen.getByText(/Capture/));
    expect(mockCapturePhoto).toHaveBeenCalled();
  });

  it("calls setMode when mode buttons clicked", () => {
    renderWithProviders(<Camera albumName="wedding" />);
    fireEvent.click(screen.getByText("Video"));
    expect(mockSetMode).toHaveBeenCalledWith("video");
  });
});
