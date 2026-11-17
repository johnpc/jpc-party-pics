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
  isMobileScreenSize: false,
}));

const tokens = {
  radii: { large: { value: "8px" } },
  space: { medium: { value: "8px" } },
};

describe("photoModalStyles on desktop", () => {
  it("centers a white card", () => {
    expect(getContainerStyle(tokens)).toMatchObject({
      position: "absolute",
      backgroundColor: "white",
      borderRadius: "8px",
    });
  });

  it("keeps the arrows inline beside the image", () => {
    expect(getArrowStyle("left")).toEqual({
      cursor: "pointer",
      padding: "1rem 0.5rem",
    });
    expect(getArrowStyle("right")).toEqual(getArrowStyle("left"));
    expect(getStageStyle()).toBeUndefined();
    expect(getArrowSize()).toBe("medium");
  });

  it("leaves the chrome to the theme", () => {
    expect(getCloseButtonStyle()).toBeUndefined();
    expect(getDownloadButtonStyle()).toBeUndefined();
    expect(getFooterStyle()).toBeUndefined();
  });
});
