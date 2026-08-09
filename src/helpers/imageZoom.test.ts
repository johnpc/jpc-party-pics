import { describe, it, expect } from "vitest";
import { isDoubleTap, panOrigin, panOffset, zoomStyle } from "./imageZoom";

describe("imageZoom helpers", () => {
  it("isDoubleTap true for fast taps, false otherwise", () => {
    expect(isDoubleTap(100)).toBe(true);
    expect(isDoubleTap(0)).toBe(false);
    expect(isDoubleTap(400)).toBe(false);
  });

  it("panOrigin subtracts current offset from the touch point", () => {
    expect(panOrigin({ clientX: 100, clientY: 80 }, { x: 20, y: 10 })).toEqual({
      x: 80,
      y: 70,
    });
  });

  it("panOffset subtracts origin from the touch point", () => {
    expect(
      panOffset({ clientX: 150, clientY: 130 }, { x: 100, y: 100 }),
    ).toEqual({ x: 50, y: 30 });
  });

  it("zoomStyle reflects zoomed state and dragging", () => {
    const zoomed = zoomStyle(2.5, { x: 5, y: 6 }, true);
    expect(zoomed.transform).toBe("translate(5px, 6px) scale(2.5)");
    expect(zoomed.transition).toBe("none");
    expect(zoomed.cursor).toBe("grab");
    expect(zoomed.touchAction).toBe("none");

    const idle = zoomStyle(1, { x: 0, y: 0 }, false);
    expect(idle.cursor).toBe("zoom-in");
    expect(idle.touchAction).toBeUndefined();
    expect(idle.transition).toContain("0.2s");
  });
});
