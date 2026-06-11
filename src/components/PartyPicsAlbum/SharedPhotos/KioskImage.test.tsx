import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../test/test-utils";
import { KioskImage } from "./KioskImage";

vi.mock("@aws-amplify/ui-react", () => ({
  Image: ({ alt, src }: { alt: string; src?: string }) => (
    <img alt={alt} src={src} />
  ),
  Loader: () => <div data-testid="loader">Loading</div>,
  useTheme: () => ({
    tokens: {
      radii: { small: { value: "4px" } },
    },
  }),
}));

vi.mock("../../../helpers/detectFileType", () => ({
  detectFileType: (key: string) => (key.endsWith(".mp4") ? "video" : "image"),
}));

vi.mock("../../../helpers/getAccelerateUrl", () => ({
  getAccelerateUrl: vi
    .fn()
    .mockResolvedValue(new URL("https://cdn.example.com/photo.jpg")),
}));

vi.mock("../../../helpers/videoSupport", () => ({
  canPlayVideoFile: () => true,
}));

describe("KioskImage", () => {
  it("shows loader initially", () => {
    renderWithProviders(
      <KioskImage
        image={{ key: "photo.jpg", date: "2024-01-01", size: 100 }}
      />,
    );
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("renders image after URL loads", async () => {
    renderWithProviders(
      <KioskImage
        image={{ key: "photo.jpg", date: "2024-01-01", size: 100 }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByAltText("photo.jpg")).toBeInTheDocument();
    });
  });

  it("renders video for video file types", async () => {
    renderWithProviders(
      <KioskImage
        image={{ key: "video.mp4", date: "2024-01-01", size: 100 }}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByAltText("video.mp4")).not.toBeInTheDocument();
    });
  });
});
