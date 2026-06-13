import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/test-utils";
import { OfflineBanner } from "./OfflineBanner";

vi.mock("@aws-amplify/ui-react", () => ({
  Flex: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: object;
  }) => (
    <div data-testid="offline-banner" style={style}>
      {children}
    </div>
  ),
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

const mockOnline = vi.fn();
vi.mock("../hooks/useOnlineStatus", () => ({
  useOnlineStatus: () => mockOnline(),
}));

describe("OfflineBanner", () => {
  it("renders nothing when online", () => {
    mockOnline.mockReturnValue(true);
    const { container } = renderWithProviders(<OfflineBanner />);
    expect(container.innerHTML).toBe("");
  });

  it("renders banner when offline", () => {
    mockOnline.mockReturnValue(false);
    renderWithProviders(<OfflineBanner />);
    expect(
      screen.getByText(
        "You're offline — uploads will resume when you reconnect",
      ),
    ).toBeInTheDocument();
  });
});
