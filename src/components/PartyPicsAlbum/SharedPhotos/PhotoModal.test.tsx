import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../test/test-utils";
import { PhotoModal } from "./PhotoModal";

vi.mock("@aws-amplify/ui-react", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  Flex: ({
    children,
    onKeyUpCapture,
  }: {
    children: React.ReactNode;
    onKeyUpCapture?: (e: { keyCode: number }) => void;
  }) => (
    <div
      data-testid="flex-container"
      onKeyUpCapture={onKeyUpCapture as unknown as React.KeyboardEventHandler}
    >
      {children}
    </div>
  ),
  Text: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <span onClick={onClick}>{children}</span>,
  useTheme: () => ({
    tokens: {
      space: { small: "4px", medium: "8px", xs: "2px", large: "16px" },
      radii: { large: { value: "8px" } },
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

vi.mock("./ModalImage", () => ({
  ModalImage: () => <div data-testid="modal-image">Image</div>,
}));

vi.mock("../../../helpers/isMobileScreenSize", () => ({
  isMobileScreenSize: false,
}));

vi.mock("../../../helpers/humanFileSize", () => ({
  humanFileSize: (bytes: number) => `${bytes}B`,
}));

const image = { key: "photo.jpg", date: "2024-01-01", size: 1000 };

describe("PhotoModal", () => {
  it("renders nothing when image is undefined", () => {
    const { container } = renderWithProviders(
      <PhotoModal
        image={undefined}
        onClose={vi.fn()}
        onBack={vi.fn()}
        onForward={vi.fn()}
        onDownload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders modal when image is provided", () => {
    renderWithProviders(
      <PhotoModal
        image={image}
        onClose={vi.fn()}
        onBack={vi.fn()}
        onForward={vi.fn()}
        onDownload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-image")).toBeInTheDocument();
  });

  it("calls onClose when modal backdrop clicked", () => {
    const onClose = vi.fn();
    renderWithProviders(
      <PhotoModal
        image={image}
        onClose={onClose}
        onBack={vi.fn()}
        onForward={vi.fn()}
        onDownload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("modal"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onBack when back arrow clicked", () => {
    const onBack = vi.fn();
    renderWithProviders(
      <PhotoModal
        image={image}
        onClose={vi.fn()}
        onBack={onBack}
        onForward={vi.fn()}
        onDownload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("arrow-back"));
    expect(onBack).toHaveBeenCalledWith(image);
  });

  it("calls onForward when forward arrow clicked", () => {
    const onForward = vi.fn();
    renderWithProviders(
      <PhotoModal
        image={image}
        onClose={vi.fn()}
        onBack={vi.fn()}
        onForward={onForward}
        onDownload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("arrow-forward"));
    expect(onForward).toHaveBeenCalledWith(image);
  });

  it("calls onDownload when download clicked", () => {
    const onDownload = vi.fn();
    renderWithProviders(
      <PhotoModal
        image={image}
        onClose={vi.fn()}
        onBack={vi.fn()}
        onForward={vi.fn()}
        onDownload={onDownload}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText(/Download/));
    expect(onDownload).toHaveBeenCalledWith("photo.jpg");
  });

  it("calls onDelete when delete clicked", () => {
    const onDelete = vi.fn();
    renderWithProviders(
      <PhotoModal
        image={image}
        onClose={vi.fn()}
        onBack={vi.fn()}
        onForward={vi.fn()}
        onDownload={vi.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith("photo.jpg");
  });

  it("shows file size in download button", () => {
    renderWithProviders(
      <PhotoModal
        image={image}
        onClose={vi.fn()}
        onBack={vi.fn()}
        onForward={vi.fn()}
        onDownload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText(/1000B/)).toBeInTheDocument();
  });

  it("calls onForward on right arrow key", () => {
    const onForward = vi.fn();
    renderWithProviders(
      <PhotoModal
        image={image}
        onClose={vi.fn()}
        onBack={vi.fn()}
        onForward={onForward}
        onDownload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const containers = screen.getAllByTestId("flex-container");
    fireEvent.keyUp(containers[0], { keyCode: 39 });
    expect(onForward).toHaveBeenCalledWith(image);
  });

  it("calls onBack on left arrow key", () => {
    const onBack = vi.fn();
    renderWithProviders(
      <PhotoModal
        image={image}
        onClose={vi.fn()}
        onBack={onBack}
        onForward={vi.fn()}
        onDownload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const containers = screen.getAllByTestId("flex-container");
    fireEvent.keyUp(containers[0], { keyCode: 37 });
    expect(onBack).toHaveBeenCalledWith(image);
  });

  it("does nothing on other keys", () => {
    const onBack = vi.fn();
    const onForward = vi.fn();
    renderWithProviders(
      <PhotoModal
        image={image}
        onClose={vi.fn()}
        onBack={onBack}
        onForward={onForward}
        onDownload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const containers = screen.getAllByTestId("flex-container");
    fireEvent.keyUp(containers[0], { keyCode: 13 });
    expect(onBack).not.toHaveBeenCalled();
    expect(onForward).not.toHaveBeenCalled();
  });
});
