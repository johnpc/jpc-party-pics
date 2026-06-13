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
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Heading: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4>,
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

vi.mock("./UploadProgress", () => ({
  UploadProgress: () => <div data-testid="upload-progress" />,
}));

vi.mock("./HeroUploadArea", () => ({
  HeroUploadArea: ({ onTapCamera }: { onTapCamera: () => void }) => (
    <div data-testid="hero-upload">
      <button onClick={onTapCamera}>📸 Camera</button>
    </div>
  ),
}));

vi.mock("../../hooks/useUploadQueue", () => ({
  useUploadQueue: () => ({
    queue: [],
    addFiles: vi.fn(),
    retryFailed: vi.fn(),
    activeCount: 0,
    errorCount: 0,
    completedCount: 0,
    isUploading: false,
  }),
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

  it("renders album name as heading", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    expect(
      screen.getByRole("heading", { name: "wedding" }),
    ).toBeInTheDocument();
  });

  it("renders share button at the top", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    expect(screen.getByText("🔗 Share")).toBeInTheDocument();
  });

  it("renders shared photos", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    expect(screen.getByTestId("shared-photos")).toHaveTextContent("wedding");
  });

  it("renders hero upload area", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    expect(screen.getByTestId("hero-upload")).toBeInTheDocument();
  });

  it("shows QR code when Share is clicked", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    fireEvent.click(screen.getByText("🔗 Share"));
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();
  });

  it("shows copy links when Share is clicked", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    fireEvent.click(screen.getByText("🔗 Share"));
    const copyLinks = screen.getAllByTestId("copy-link");
    expect(copyLinks.length).toBeGreaterThanOrEqual(2);
  });

  it("renders upload progress component", () => {
    renderWithProviders(<PartyPicsAlbum albumName="wedding" />);
    expect(screen.getByTestId("upload-progress")).toBeInTheDocument();
  });
});
