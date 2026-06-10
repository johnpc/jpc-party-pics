import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { ModeToggle } from "./ModeToggle";

vi.mock("@aws-amplify/ui-react", () => ({
  Button: ({
    children,
    onClick,
    variation,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variation?: string;
  }) => (
    <button onClick={onClick} data-variation={variation}>
      {children}
    </button>
  ),
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("ModeToggle", () => {
  it("renders Photo and Video buttons", () => {
    renderWithProviders(<ModeToggle mode="photo" onSetMode={vi.fn()} />);
    expect(screen.getByText("Photo")).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument();
  });

  it("highlights Photo when in photo mode", () => {
    renderWithProviders(<ModeToggle mode="photo" onSetMode={vi.fn()} />);
    expect(screen.getByText("Photo")).toHaveAttribute(
      "data-variation",
      "primary",
    );
    expect(screen.getByText("Video")).toHaveAttribute("data-variation", "link");
  });

  it("highlights Video when in video mode", () => {
    renderWithProviders(<ModeToggle mode="video" onSetMode={vi.fn()} />);
    expect(screen.getByText("Video")).toHaveAttribute(
      "data-variation",
      "primary",
    );
    expect(screen.getByText("Photo")).toHaveAttribute("data-variation", "link");
  });

  it("calls onSetMode with 'photo' when Photo clicked", () => {
    const onSetMode = vi.fn();
    renderWithProviders(<ModeToggle mode="video" onSetMode={onSetMode} />);
    fireEvent.click(screen.getByText("Photo"));
    expect(onSetMode).toHaveBeenCalledWith("photo");
  });

  it("calls onSetMode with 'video' when Video clicked", () => {
    const onSetMode = vi.fn();
    renderWithProviders(<ModeToggle mode="photo" onSetMode={onSetMode} />);
    fireEvent.click(screen.getByText("Video"));
    expect(onSetMode).toHaveBeenCalledWith("video");
  });
});
