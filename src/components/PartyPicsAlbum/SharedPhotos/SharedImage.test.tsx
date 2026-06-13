import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../test/test-utils";
import { SharedImage } from "./SharedImage";

vi.mock("@aws-amplify/ui-react", () => ({
  Card: ({
    children,
    ref,
  }: {
    children: React.ReactNode;
    ref?: React.Ref<HTMLDivElement>;
  }) => (
    <div ref={ref} data-testid="card">
      {children}
    </div>
  ),
  Image: ({
    alt,
    src,
    onClick,
  }: {
    alt: string;
    src?: string;
    onClick?: () => void;
  }) => <img alt={alt} src={src} onClick={onClick} />,
  Loader: () => <div data-testid="loader">Loading</div>,
  useTheme: () => ({
    tokens: {
      space: { xxxs: "1px" },
      radii: { large: { value: "8px" } },
    },
  }),
}));

const mockDetectFileType = vi.fn().mockReturnValue("image");
vi.mock("../../../helpers/detectFileType", () => ({
  detectFileType: (...args: unknown[]) => mockDetectFileType(...args),
}));

vi.mock("../../../helpers/getAccelerateUrl", () => ({
  getAccelerateUrl: vi
    .fn()
    .mockResolvedValue(new URL("https://cdn.example.com/photo.jpg")),
}));

vi.mock("../../../helpers/isMobileScreenSize", () => ({
  isMobileScreenSize: false,
}));

const mockCanPlay = vi.fn().mockReturnValue(true);
vi.mock("../../../helpers/videoSupport", () => ({
  canPlayVideoFile: (...args: unknown[]) => mockCanPlay(...args),
}));

vi.mock("../../../hooks/useInView", () => ({
  useInView: () => ({ ref: { current: null }, inView: true }),
}));

vi.mock("./VideoFallback", () => ({
  VideoFallback: ({ url }: { url?: string }) => (
    <div data-testid="video-fallback">
      {url ? "Download to view" : "Video unavailable"}
    </div>
  ),
}));

describe("SharedImage", () => {
  it("renders an image once URL resolves", async () => {
    mockDetectFileType.mockReturnValue("image");
    renderWithProviders(
      <SharedImage
        image={{ key: "photo.jpg", date: "2024-01-01", size: 100 }}
        handleOpenModal={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByAltText("photo.jpg")).toBeInTheDocument();
    });
  });

  it("calls handleOpenModal when clicked", async () => {
    mockDetectFileType.mockReturnValue("image");
    const handleOpenModal = vi.fn();
    const image = { key: "photo.jpg", date: "2024-01-01", size: 100 };

    renderWithProviders(
      <SharedImage image={image} handleOpenModal={handleOpenModal} />,
    );

    await waitFor(() => {
      expect(screen.getByAltText("photo.jpg")).toBeInTheDocument();
    });

    screen.getByAltText("photo.jpg").click();
    expect(handleOpenModal).toHaveBeenCalledWith(image);
  });

  it("renders video element for supported video files", async () => {
    mockDetectFileType.mockReturnValue("video");
    mockCanPlay.mockReturnValue(true);

    const { container } = renderWithProviders(
      <SharedImage
        image={{ key: "clip.mp4", date: "2024-01-01", size: 5000 }}
        handleOpenModal={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(container.querySelector("video")).toBeTruthy();
    });
  });

  it("renders VideoFallback for unsupported video formats", async () => {
    mockDetectFileType.mockReturnValue("video");
    mockCanPlay.mockReturnValue(false);

    renderWithProviders(
      <SharedImage
        image={{ key: "clip.webm", date: "2024-01-01", size: 5000 }}
        handleOpenModal={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Download to view")).toBeInTheDocument();
    });
  });

  it("shows loader before URL resolves", () => {
    mockDetectFileType.mockReturnValue("image");
    renderWithProviders(
      <SharedImage
        image={{ key: "photo.jpg", date: "2024-01-01", size: 100 }}
        handleOpenModal={vi.fn()}
      />,
    );

    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });
});
