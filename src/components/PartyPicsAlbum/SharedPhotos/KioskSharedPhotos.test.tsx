import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/test-utils";
import { KioskSharedPhotos } from "./KioskSharedPhotos";

vi.mock("@aws-amplify/ui-react", () => ({
  Heading: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4>,
  Loader: () => <div data-testid="loader">Loading</div>,
  useTheme: () => ({
    tokens: { space: { xs: { value: "2px" } } },
  }),
}));

vi.mock("./KioskImage", () => ({
  KioskImage: ({ image }: { image: { key: string } }) => (
    <div data-testid={`kiosk-image-${image.key}`}>{image.key}</div>
  ),
}));

const mockUseImages = vi.fn();
vi.mock("../../../hooks/useImages", () => ({
  useImages: (...args: unknown[]) => mockUseImages(...args),
}));

describe("KioskSharedPhotos", () => {
  it("shows loader when loading", () => {
    mockUseImages.mockReturnValue({ data: [], isLoading: true });
    renderWithProviders(<KioskSharedPhotos albumName="wedding" />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("shows empty message when no photos", () => {
    mockUseImages.mockReturnValue({ data: [], isLoading: false });
    renderWithProviders(<KioskSharedPhotos albumName="wedding" />);
    expect(screen.getByText("No photos yet")).toBeInTheDocument();
  });

  it("renders kiosk images when photos exist", () => {
    mockUseImages.mockReturnValue({
      data: [
        { key: "a.jpg", date: "2024-01-01", size: 100 },
        { key: "b.jpg", date: "2024-02-01", size: 200 },
      ],
      isLoading: false,
    });
    renderWithProviders(<KioskSharedPhotos albumName="wedding" />);
    expect(screen.getByTestId("kiosk-image-a.jpg")).toBeInTheDocument();
    expect(screen.getByTestId("kiosk-image-b.jpg")).toBeInTheDocument();
  });
});
