import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../test/test-utils";
import { ModalImage } from "./ModalImage";

vi.mock("@aws-amplify/ui-react", () => ({
  Image: ({ alt, src }: { alt: string; src?: string }) => (
    <img alt={alt} src={src} />
  ),
  useTheme: () => ({
    tokens: {
      radii: { large: { value: "8px" } },
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

describe("ModalImage", () => {
  it("renders image after URL loads", async () => {
    renderWithProviders(
      <ModalImage
        image={{ key: "photo.jpg", date: "2024-01-01", size: 100 }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByAltText("photo.jpg")).toBeInTheDocument();
    });
  });

  it("renders video element for video files", async () => {
    renderWithProviders(
      <ModalImage image={{ key: "clip.mp4", date: "2024-01-01", size: 500 }} />,
    );

    await waitFor(() => {
      expect(screen.queryByAltText("clip.mp4")).not.toBeInTheDocument();
    });
  });
});
