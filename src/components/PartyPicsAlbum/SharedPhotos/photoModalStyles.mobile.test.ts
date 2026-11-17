import { describe, it, expect, vi } from "vitest";
import {
  getArrowSize,
  getArrowStyle,
  getCloseButtonStyle,
  getContainerStyle,
  getDownloadButtonStyle,
  getFooterStyle,
  getStageStyle,
} from "./photoModalStyles";

vi.mock("../../../helpers/isMobileScreenSize", () => ({
  isMobileScreenSize: true,
}));

const tokens = {
  radii: { large: { value: "8px" } },
  space: { medium: { value: "8px" } },
};

describe("photoModalStyles on a phone", () => {
  it("uses a full-screen dark container", () => {
    expect(getContainerStyle(tokens)).toMatchObject({
      position: "fixed",
      inset: 0,
    });
  });

  it("floats the arrows over the image edges so they stay tappable", () => {
    expect(getArrowStyle("left")).toMatchObject({
      position: "absolute",
      left: "0.25rem",
      zIndex: 1,
      color: "white",
    });
    expect(getArrowStyle("right")).toMatchObject({ right: "0.25rem" });
    expect(getStageStyle()).toEqual({ position: "relative" });
    expect(getArrowSize()).toBe("large");
  });

  it("styles the chrome for a dark backdrop", () => {
    expect(getCloseButtonStyle()).toMatchObject({ color: "white" });
    expect(getDownloadButtonStyle()).toEqual({ color: "white" });
    expect(getFooterStyle()).toMatchObject({
      paddingBottom: "env(safe-area-inset-bottom, 16px)",
    });
  });
});
