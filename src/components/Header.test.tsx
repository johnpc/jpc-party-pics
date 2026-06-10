import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/test-utils";
import { Header } from "./Header";

vi.mock("@aws-amplify/ui-react", () => ({
  Card: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <div data-testid="card" onClick={onClick}>
      {children}
    </div>
  ),
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Heading: ({ children }: { children: React.ReactNode }) => <h5>{children}</h5>,
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Image: ({ alt }: { alt: string }) => <img alt={alt} />,
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTheme: () => ({
    tokens: { space: { small: "4px" }, radii: { large: "8px" } },
  }),
}));

describe("Header", () => {
  it("renders the site name", () => {
    renderWithProviders(<Header />);
    expect(screen.getByText("partypics.jpc.io")).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    renderWithProviders(<Header />);
    expect(screen.getByText("Collaborative event photos")).toBeInTheDocument();
  });

  it("navigates home on click", () => {
    const originalHref = window.location.href;
    Object.defineProperty(window, "location", {
      value: { href: originalHref },
      writable: true,
    });

    renderWithProviders(<Header />);
    const card = screen.getByTestId("card");
    card.click();
    expect(window.location.href).toBe("/");
  });
});
