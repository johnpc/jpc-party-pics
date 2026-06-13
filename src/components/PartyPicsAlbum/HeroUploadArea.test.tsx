import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { HeroUploadArea } from "./HeroUploadArea";

vi.mock("@aws-amplify/ui-react", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTheme: () => ({
    tokens: {
      space: { small: "4px", medium: "8px", xs: "2px", large: "16px" },
      fontSizes: { small: "12px", large: "16px" },
    },
  }),
}));

vi.mock("../../helpers/isMobileScreenSize", () => ({
  isMobileScreenSize: true,
}));

describe("HeroUploadArea", () => {
  const defaultProps = {
    onFilesSelected: vi.fn(),
    onTapCamera: vi.fn(),
    isUploading: false,
    activeCount: 0,
    errorCount: 0,
    onRetry: vi.fn(),
  };

  it("renders upload and camera buttons", () => {
    renderWithProviders(<HeroUploadArea {...defaultProps} />);
    expect(screen.getByText("📁 Choose Files")).toBeInTheDocument();
    expect(screen.getByText("📸 Camera")).toBeInTheDocument();
  });

  it("renders headline text", () => {
    renderWithProviders(<HeroUploadArea {...defaultProps} />);
    expect(screen.getByText("Add your photos & videos")).toBeInTheDocument();
  });

  it("calls onTapCamera when Camera clicked", () => {
    renderWithProviders(<HeroUploadArea {...defaultProps} />);
    fireEvent.click(screen.getByText("📸 Camera"));
    expect(defaultProps.onTapCamera).toHaveBeenCalled();
  });

  it("calls onFilesSelected when files are chosen", () => {
    const onFilesSelected = vi.fn();
    renderWithProviders(
      <HeroUploadArea {...defaultProps} onFilesSelected={onFilesSelected} />,
    );
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    Object.defineProperty(input, "files", { value: [file], writable: false });
    fireEvent.change(input);
    expect(onFilesSelected).toHaveBeenCalled();
  });

  it("shows uploading status when active", () => {
    renderWithProviders(
      <HeroUploadArea {...defaultProps} isUploading={true} activeCount={3} />,
    );
    expect(screen.getByText("Uploading 3 files...")).toBeInTheDocument();
  });

  it("shows singular file text for 1 upload", () => {
    renderWithProviders(
      <HeroUploadArea {...defaultProps} isUploading={true} activeCount={1} />,
    );
    expect(screen.getByText("Uploading 1 file...")).toBeInTheDocument();
  });

  it("shows error count and retry button", () => {
    renderWithProviders(<HeroUploadArea {...defaultProps} errorCount={2} />);
    expect(screen.getByText("2 failed")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("calls onRetry when Retry clicked", () => {
    const onRetry = vi.fn();
    renderWithProviders(
      <HeroUploadArea {...defaultProps} errorCount={1} onRetry={onRetry} />,
    );
    fireEvent.click(screen.getByText("Retry"));
    expect(onRetry).toHaveBeenCalled();
  });

  it("hides status section when not uploading and no errors", () => {
    renderWithProviders(<HeroUploadArea {...defaultProps} />);
    expect(screen.queryByText(/Uploading/)).not.toBeInTheDocument();
    expect(screen.queryByText(/failed/)).not.toBeInTheDocument();
  });
});
