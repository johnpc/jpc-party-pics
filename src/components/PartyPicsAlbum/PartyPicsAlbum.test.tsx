import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { PartyPicsAlbum } from "./PartyPicsAlbum";

vi.mock("@aws-amplify/ui-react", () => ({
  Divider: () => <hr />,
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTheme: () => ({
    tokens: {
      space: { small: "4px", medium: "8px" },
      fontSizes: { small: "12px" },
    },
  }),
}));

vi.mock("@aws-amplify/ui-react-storage", () => ({
  FileUploader: () => <div data-testid="file-uploader">FileUploader</div>,
}));

vi.mock("react-qr-code", () => ({
  default: () => <div data-testid="qr-code">QR</div>,
}));

vi.mock("./CopyLink", () => ({
  CopyLink: ({ link }: { link: string }) => (
    <div data-testid="copy-link">{link}</div>
  ),
}));

vi.mock("./CameraButton", () => ({
  CameraButton: ({ albumName }: { albumName: string }) => (
    <div data-testid="camera-button">{albumName}</div>
  ),
}));

vi.mock("./SharedPhotos/SharedPhotos", () => ({
  SharedPhotos: ({ albumName }: { albumName: string }) => (
    <div data-testid="shared-photos">{albumName}</div>
  ),
}));

vi.mock("../../hooks/useImages", () => ({
  useUploadImage: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock("../../helpers/compressMedia", () => ({
  compressMedia: vi.fn(),
}));

describe("PartyPicsAlbum", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: {
        pathname: "/wedding/",
        href: "https://partypics.jpc.io/wedding/",
        origin: "https://partypics.jpc.io",
      },
      writable: true,
    });
  });

  it("renders QR code", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();
  });

  it("renders camera button with album name", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    expect(screen.getByTestId("camera-button")).toHaveTextContent("wedding");
  });

  it("renders file uploader", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    expect(screen.getByTestId("file-uploader")).toBeInTheDocument();
  });

  it("renders shared photos", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    expect(screen.getByTestId("shared-photos")).toHaveTextContent("wedding");
  });

  it("renders copy link buttons", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    const copyLinks = screen.getAllByTestId("copy-link");
    expect(copyLinks.length).toBe(2);
  });
});
