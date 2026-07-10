import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { HoneymoonFund } from "./HoneymoonFund";

vi.mock("@aws-amplify/ui-react", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Heading: ({ children }: { children: React.ReactNode }) => <h5>{children}</h5>,
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Button: ({
    children,
    href,
    onClick,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    "aria-label"?: string;
  }) =>
    href ? (
      <a href={href}>{children}</a>
    ) : (
      <button onClick={onClick} aria-label={ariaLabel}>
        {children}
      </button>
    ),
  useTheme: () => ({
    tokens: {
      space: { xxs: "1px", xs: "2px", small: "4px", medium: "8px" },
      radii: { large: "16px" },
      colors: { background: { secondary: "#eee" } },
    },
  }),
}));

describe("HoneymoonFund", () => {
  it("links the donate button to the fundraiser", () => {
    renderWithProviders(<HoneymoonFund />);
    expect(screen.getByText("Donate").closest("a")).toHaveAttribute(
      "href",
      "https://fundraise.jpc.io/goal/303574f2-155d-4202-81c6-e710fc78173b/",
    );
  });

  it("can be dismissed", () => {
    renderWithProviders(<HoneymoonFund />);
    expect(screen.getByText(/Help fund our honeymoon/)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss honeymoon fund" }),
    );
    expect(
      screen.queryByText(/Help fund our honeymoon/),
    ).not.toBeInTheDocument();
  });
});
