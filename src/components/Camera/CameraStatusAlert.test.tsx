import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { CameraStatusAlert } from "./CameraStatusAlert";

vi.mock("@aws-amplify/ui-react", () => ({
  Alert: ({
    children,
    variation,
  }: {
    children: React.ReactNode;
    variation: string;
  }) => <div data-testid={`alert-${variation}`}>{children}</div>,
}));

describe("CameraStatusAlert", () => {
  it("renders nothing when idle", () => {
    const { container } = renderWithProviders(
      <CameraStatusAlert status="idle" />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders uploading alert", () => {
    renderWithProviders(<CameraStatusAlert status="uploading" />);
    expect(screen.getByTestId("alert-info")).toHaveTextContent("Uploading...");
  });

  it("renders success alert", () => {
    renderWithProviders(<CameraStatusAlert status="success" />);
    expect(screen.getByTestId("alert-success")).toHaveTextContent("Success!");
  });
});
