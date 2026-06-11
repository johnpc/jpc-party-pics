import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { PartyPicsAlbum } from "./PartyPicsAlbum";

vi.mock("@aws-amplify/ui-react", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  Divider: () => <hr />,
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTheme: () => ({
    tokens: {
      space: { small: "4px", medium: "8px", xs: "2px", large: "16px" },
      fontSizes: { small: "12px", large: "16px" },
      radii: { large: { value: "8px" } },
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

vi.mock("../../helpers/isMobileScreenSize", () => ({
  isMobileScreenSize: false,
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

  it("renders shared photos", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    expect(screen.getByTestId("shared-photos")).toHaveTextContent("wedding");
  });

  it("renders action buttons (Camera, Upload, Share)", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    expect(screen.getByText("📸 Camera")).toBeInTheDocument();
    expect(screen.getByText("📁 Upload")).toBeInTheDocument();
    expect(screen.getByText("🔗 Share")).toBeInTheDocument();
  });

  it("shows file uploader when Upload is clicked", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    expect(screen.queryByTestId("file-uploader")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("📁 Upload"));
    expect(screen.getByTestId("file-uploader")).toBeInTheDocument();
  });

  it("shows QR code when Share is clicked", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    fireEvent.click(screen.getByText("🔗 Share"));
    expect(screen.getAllByTestId("qr-code").length).toBeGreaterThanOrEqual(1);
  });

  it("shows QR code on desktop by default", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();
  });

  it("renders copy link buttons on desktop", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    const copyLinks = screen.getAllByTestId("copy-link");
    expect(copyLinks.length).toBeGreaterThanOrEqual(2);
  });
});
