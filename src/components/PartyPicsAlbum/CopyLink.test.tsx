import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { CopyLink } from "./CopyLink";

vi.mock("@aws-amplify/ui-react", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  useTheme: () => ({
    tokens: { space: { medium: "8px" } },
  }),
}));

vi.mock("react-copy-to-clipboard", () => ({
  CopyToClipboard: ({
    children,
    onCopy,
  }: {
    children: React.ReactNode;
    onCopy: () => void;
  }) => <div onClick={onCopy}>{children}</div>,
}));

describe("CopyLink", () => {
  it("renders default label", () => {
    renderWithProviders(<CopyLink link="https://example.com" />);
    expect(screen.getByText("Copy Album Link")).toBeInTheDocument();
  });

  it("renders custom label", () => {
    renderWithProviders(
      <CopyLink link="https://example.com" label="Copy Kiosk Link" />,
    );
    expect(screen.getByText("Copy Kiosk Link")).toBeInTheDocument();
  });

  it("shows checkmark after copy", () => {
    vi.useFakeTimers();
    renderWithProviders(<CopyLink link="https://example.com" />);
    const button = screen.getByText("Copy Album Link");
    fireEvent.click(button);
    expect(screen.queryByText("Copy Album Link")).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Copy Album Link")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
