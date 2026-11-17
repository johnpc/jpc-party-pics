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
      <CameraStatusAlert phase={{ kind: "idle" }} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders uploading alert", () => {
    renderWithProviders(<CameraStatusAlert phase={{ kind: "uploading" }} />);
    expect(screen.getByTestId("alert-info")).toHaveTextContent("Uploading...");
  });

  it("renders success alert", () => {
    renderWithProviders(<CameraStatusAlert phase={{ kind: "success" }} />);
    expect(screen.getByTestId("alert-success")).toHaveTextContent("Success!");
  });

  it("shows recorded size while recording", () => {
    renderWithProviders(
      <CameraStatusAlert phase={{ kind: "recording", bytes: 51_200 }} />,
    );
    expect(screen.getByTestId("alert-info")).toHaveTextContent(
      "Recording... 50 KB captured",
    );
  });

  it("explains a denied camera permission", () => {
    renderWithProviders(
      <CameraStatusAlert phase={{ kind: "idle" }} stream="denied" />,
    );
    expect(screen.getByTestId("alert-error")).toHaveTextContent(
      /Camera access was denied/,
    );
  });

  it("renders nothing when the stream is live and idle", () => {
    const { container } = renderWithProviders(
      <CameraStatusAlert phase={{ kind: "idle" }} stream="live" />,
    );
    expect(container.innerHTML).toBe("");
  });
});
