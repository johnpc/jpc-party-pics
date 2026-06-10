import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { CameraCapture } from "./CameraCapture";

const mockStartCamera = vi.fn();
const mockStopCamera = vi.fn();
const mockCapturePhoto = vi.fn();
const mockStartRecording = vi.fn();
const mockStopRecording = vi.fn();
const mockSetMode = vi.fn();

let mockStreaming = false;
let mockMode: "photo" | "video" = "photo";
let mockRecording = false;

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
  Divider: () => <hr />,
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
    mode: mockMode,
    setMode: mockSetMode,
    streaming: mockStreaming,
    recording: mockRecording,
    status: "idle",
    startCamera: mockStartCamera,
    stopCamera: mockStopCamera,
    capturePhoto: mockCapturePhoto,
    startRecording: mockStartRecording,
    stopRecording: mockStopRecording,
  }),
}));

describe("CameraCapture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStreaming = false;
    mockMode = "photo";
    mockRecording = false;
  });

  it("renders Use Camera button when not streaming", () => {
    renderWithProviders(<CameraCapture albumName="wedding" />);
    expect(screen.getByText(/Use Camera/)).toBeInTheDocument();
  });

  it("calls startCamera when Use Camera clicked", () => {
    renderWithProviders(<CameraCapture albumName="wedding" />);
    fireEvent.click(screen.getByText(/Use Camera/));
    expect(mockStartCamera).toHaveBeenCalled();
  });

  it("shows camera controls when streaming", () => {
    mockStreaming = true;
    renderWithProviders(<CameraCapture albumName="wedding" />);
    expect(screen.getByText("Photo")).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("shows capture button in photo mode", () => {
    mockStreaming = true;
    renderWithProviders(<CameraCapture albumName="wedding" />);
    expect(screen.getByText(/Capture Photo/)).toBeInTheDocument();
  });

  it("shows recording button in video mode", () => {
    mockStreaming = true;
    mockMode = "video";
    renderWithProviders(<CameraCapture albumName="wedding" />);
    expect(screen.getByText(/Start Recording/)).toBeInTheDocument();
  });

  it("shows stop recording when recording", () => {
    mockStreaming = true;
    mockMode = "video";
    mockRecording = true;
    renderWithProviders(<CameraCapture albumName="wedding" />);
    expect(screen.getByText(/Stop Recording/)).toBeInTheDocument();
  });

  it("calls stopCamera when Close clicked", () => {
    mockStreaming = true;
    renderWithProviders(<CameraCapture albumName="wedding" />);
    fireEvent.click(screen.getByText("Close"));
    expect(mockStopCamera).toHaveBeenCalled();
  });

  it("calls capturePhoto when capture clicked", () => {
    mockStreaming = true;
    renderWithProviders(<CameraCapture albumName="wedding" />);
    fireEvent.click(screen.getByText(/Capture Photo/));
    expect(mockCapturePhoto).toHaveBeenCalled();
  });

  it("calls startRecording in video mode", () => {
    mockStreaming = true;
    mockMode = "video";
    renderWithProviders(<CameraCapture albumName="wedding" />);
    fireEvent.click(screen.getByText(/Start Recording/));
    expect(mockStartRecording).toHaveBeenCalled();
  });

  it("calls stopRecording when recording", () => {
    mockStreaming = true;
    mockMode = "video";
    mockRecording = true;
    renderWithProviders(<CameraCapture albumName="wedding" />);
    fireEvent.click(screen.getByText(/Stop Recording/));
    expect(mockStopRecording).toHaveBeenCalled();
  });
});
