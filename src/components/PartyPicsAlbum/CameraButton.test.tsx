import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { CameraButton } from "./CameraButton";

vi.mock("@aws-amplify/ui-react", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  useTheme: () => ({
    tokens: {
      space: { medium: { value: "8px" }, large: { value: "16px" } },
      fontSizes: { large: { value: "18px" } },
    },
  }),
}));

describe("CameraButton", () => {
  it("renders the camera button text", () => {
    renderWithProviders(<CameraButton albumName="wedding" />);
    expect(screen.getByRole("button")).toHaveTextContent("Use In-App Camera");
  });

  it("navigates to camera page on click", () => {
    Object.defineProperty(window, "location", {
      value: { href: "/" },
      writable: true,
    });

    renderWithProviders(<CameraButton albumName="wedding" />);
    fireEvent.click(screen.getByRole("button"));
    expect(window.location.href).toBe("/wedding/camera");
  });
});
