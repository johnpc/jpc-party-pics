import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { UploadProgress } from "./UploadProgress";
import { QueuedUpload } from "../../helpers/uploadQueue";

vi.mock("@aws-amplify/ui-react", () => ({
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  useTheme: () => ({
    tokens: { space: { xs: "2px", small: "4px" } },
  }),
}));

const makeItem = (overrides: Partial<QueuedUpload>): QueuedUpload => ({
  id: "test-1",
  fileName: "photo.jpg",
  fileSize: 1024,
  fileType: "image/jpeg",
  albumName: "wedding",
  status: "uploading",
  progress: 50,
  retryCount: 0,
  addedAt: Date.now(),
  ...overrides,
});

describe("UploadProgress", () => {
  it("renders nothing when queue is empty", () => {
    const { container } = renderWithProviders(<UploadProgress queue={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when all items are complete", () => {
    const { container } = renderWithProviders(
      <UploadProgress queue={[makeItem({ status: "complete" })]} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders uploading items", () => {
    renderWithProviders(
      <UploadProgress queue={[makeItem({ status: "uploading" })]} />,
    );
    expect(screen.getByText("photo.jpg")).toBeInTheDocument();
    expect(screen.getByText("Uploading...")).toBeInTheDocument();
  });

  it("shows error message for failed items", () => {
    renderWithProviders(
      <UploadProgress
        queue={[makeItem({ status: "error", error: "Network timeout" })]}
      />,
    );
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Network timeout")).toBeInTheDocument();
  });

  it("truncates long file names", () => {
    renderWithProviders(
      <UploadProgress
        queue={[makeItem({ fileName: "a-very-long-photo-filename.jpg" })]}
      />,
    );
    expect(screen.getByText("a-very-long-photo...")).toBeInTheDocument();
  });

  it("shows pending status", () => {
    renderWithProviders(
      <UploadProgress queue={[makeItem({ status: "pending" })]} />,
    );
    expect(screen.getByText("Waiting...")).toBeInTheDocument();
  });

  it("shows compressing status", () => {
    renderWithProviders(
      <UploadProgress queue={[makeItem({ status: "compressing" })]} />,
    );
    expect(screen.getByText("Compressing...")).toBeInTheDocument();
  });
});
