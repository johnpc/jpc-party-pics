import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../test/test-utils";
import { SharedPhotos } from "./SharedPhotos";

const mockDeleteMutateAsync = vi.fn().mockResolvedValue({});
const mockGetUrl = vi.fn().mockResolvedValue({
  url: new URL("https://example.com/file"),
});

vi.mock("@aws-amplify/ui-react", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  Card: ({
    children,
    onKeyUpCapture,
  }: {
    children: React.ReactNode;
    onKeyUpCapture?: (e: { keyCode: number }) => void;
  }) => (
    <div
      data-testid="card"
      onKeyUp={onKeyUpCapture as React.KeyboardEventHandler}
    >
      {children}
    </div>
  ),
  Collection: ({
    items,
    children,
    searchNoResultsFound,
  }: {
    items: unknown[];
    children: (item: { key: string }) => React.ReactNode;
    searchNoResultsFound: React.ReactNode;
  }) => (
    <div data-testid="collection">
      {items.length === 0
        ? searchNoResultsFound
        : items.map((item) => children(item as { key: string }))}
    </div>
  ),
  Divider: () => <hr />,
  Heading: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4>,
  Loader: () => <div data-testid="loader">Loading</div>,
  Text: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <span onClick={onClick}>{children}</span>,
  useTheme: () => ({
    tokens: {
      space: { medium: "8px", large: "16px", small: "4px" },
    },
  }),
}));

vi.mock("@mui/material", () => ({
  Modal: ({
    children,
    open,
    onClose,
  }: {
    children: React.ReactNode;
    open: boolean;
    onClose: () => void;
  }) =>
    open ? (
      <div data-testid="modal" onClick={onClose}>
        {children}
      </div>
    ) : null,
}));

vi.mock("@mui/icons-material/ArrowBackIos", () => ({
  default: () => <span data-testid="arrow-back">Back</span>,
}));

vi.mock("@mui/icons-material/ArrowForwardIos", () => ({
  default: () => <span data-testid="arrow-forward">Forward</span>,
}));

vi.mock("../../../../amplify_outputs.json", () => ({
  custom: { zipFileEndpoint: "https://example.com/zip" },
}));

vi.mock("aws-amplify/storage", () => ({
  getUrl: (...args: unknown[]) => mockGetUrl(...args),
}));

vi.mock("./SharedImage", () => ({
  SharedImage: ({
    image,
    handleOpenModal,
  }: {
    image: { key: string };
    handleOpenModal: (img: { key: string }) => void;
  }) => (
    <div
      data-testid={`shared-image-${image.key}`}
      onClick={() => handleOpenModal(image)}
    >
      {image.key}
    </div>
  ),
}));

vi.mock("./ModalImage", () => ({
  ModalImage: () => <div data-testid="modal-image">Modal Image</div>,
}));

vi.mock("./PhotoModal", () => ({
  PhotoModal: ({ image, onClose }: { image: unknown; onClose: () => void }) =>
    image ? (
      <div data-testid="photo-modal" onClick={onClose}>
        Modal Open
      </div>
    ) : null,
}));

vi.mock("../../../helpers/isMobileScreenSize", () => ({
  isMobileScreenSize: false,
}));

vi.mock("../../../hooks/useImages", () => ({
  useImages: () => ({
    data: [
      { key: "photo1.jpg", date: "2024-01-01", size: 1000 },
      { key: "photo2.jpg", date: "2024-06-01", size: 2000 },
    ],
    isLoading: false,
  }),
  useDeleteImage: () => ({
    mutateAsync: mockDeleteMutateAsync,
  }),
}));

describe("SharedPhotos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    vi.stubGlobal("open", vi.fn());
    vi.stubGlobal("alert", vi.fn());
  });

  it("renders the album title", () => {
    renderWithProviders(<SharedPhotos albumName="wedding" />);
    expect(
      screen.getByText(/Photos shared to album "wedding"/),
    ).toBeInTheDocument();
  });

  it("renders shared images", () => {
    renderWithProviders(<SharedPhotos albumName="wedding" />);
    expect(screen.getByTestId("shared-image-photo1.jpg")).toBeInTheDocument();
    expect(screen.getByTestId("shared-image-photo2.jpg")).toBeInTheDocument();
  });

  it("renders download all button", () => {
    renderWithProviders(<SharedPhotos albumName="wedding" />);
    expect(screen.getByText(/Download All 2 files/)).toBeInTheDocument();
  });

  it("opens modal when image clicked", () => {
    renderWithProviders(<SharedPhotos albumName="wedding" />);
    fireEvent.click(screen.getByTestId("shared-image-photo1.jpg"));
    expect(screen.getByTestId("photo-modal")).toBeInTheDocument();
  });

  it("closes modal on backdrop click", () => {
    renderWithProviders(<SharedPhotos albumName="wedding" />);
    fireEvent.click(screen.getByTestId("shared-image-photo1.jpg"));
    expect(screen.getByTestId("photo-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("photo-modal"));
    expect(screen.queryByTestId("photo-modal")).not.toBeInTheDocument();
  });

  it("calls downloadAll on button click", () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ key: "zip-key" }),
    });
    vi.stubGlobal("fetch", mockFetch);
    renderWithProviders(<SharedPhotos albumName="wedding" />);
    fireEvent.click(screen.getByText(/Download All/));
    expect(vi.mocked(confirm)).toHaveBeenCalled();
  });
});
