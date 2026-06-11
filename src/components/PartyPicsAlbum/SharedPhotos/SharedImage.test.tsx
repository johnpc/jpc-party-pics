import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../test/test-utils";
import { SharedImage } from "./SharedImage";

vi.mock("@aws-amplify/ui-react", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

vi.mock("../../../helpers/detectFileType", () => ({
  detectFileType: (key: string) => (key.endsWith(".mp4") ? "video" : "image"),
}));

vi.mock("../../../helpers/getAccelerateUrl", () => ({
  getAccelerateUrl: vi
    .fn()
    .mockResolvedValue(new URL("https://cdn.example.com/photo.jpg")),
}));

vi.mock("../../../helpers/isMobileScreenSize", () => ({
  isMobileScreenSize: false,
}));

vi.mock("../../../helpers/videoSupport", () => ({
  canPlayVideoFile: () => true,
}));

describe("SharedImage", () => {
  it("renders an image once URL resolves", async () => {
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
});
