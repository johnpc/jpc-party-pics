import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/test-utils";
import { VideoFallback } from "./VideoFallback";

vi.mock("@aws-amplify/ui-react", () => ({
  Flex: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <div data-testid="fallback" onClick={onClick}>
      {children}
    </div>
  ),
  Text: ({
    children,
    as,
    href,
  }: {
    children: React.ReactNode;
    as?: string;
    href?: string;
  }) =>
    as === "a" ? (
      <a href={href} data-testid="download-link">
        {children}
      </a>
    ) : (
      <span>{children}</span>
    ),
  useTheme: () => ({
    tokens: {
      radii: { large: { value: "8px" } },
      fontSizes: { xs: "0.75rem" },
    },
  }),
}));

describe("VideoFallback", () => {
  it("renders download link when url is provided", () => {
    renderWithProviders(<VideoFallback url="https://example.com/video.webm" />);
    expect(screen.getByTestId("download-link")).toHaveAttribute(
      "href",
      "https://example.com/video.webm",
    );
  });

  it("renders unavailable text when no url", () => {
    renderWithProviders(<VideoFallback />);
    expect(screen.getByText("Video unavailable")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    renderWithProviders(
      <VideoFallback url="https://example.com/video.webm" onClick={onClick} />,
    );
    screen.getByTestId("fallback").click();
    expect(onClick).toHaveBeenCalled();
  });
});
