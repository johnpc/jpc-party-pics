import { describe, it, expect } from "vitest";
import {
  ZOOM_SCALE,
  beginPan,
  endPan,
  isGhostClick,
  isZoomed,
  movePan,
  noTaps,
  registerTap,
  rest,
  toggleZoom,
  zoomStyle,
} from "./imageZoom";

describe("imageZoom state", () => {
  it("toggles rest ⇄ zoomed with a reset offset", () => {
    const zoomed = toggleZoom(rest);
    expect(zoomed).toEqual({ kind: "zoomed", offset: { x: 0, y: 0 } });
    expect(toggleZoom(zoomed)).toEqual(rest);
  });

  it("pans only while zoomed", () => {
    expect(beginPan(rest, { x: 10, y: 10 })).toEqual(rest);
    expect(movePan(rest, { x: 10, y: 10 })).toEqual(rest);
    const zoomed = toggleZoom(rest);
    const panning = beginPan(zoomed, { x: 100, y: 100 });
    expect(panning.kind).toBe("panning");
    const moved = movePan(panning, { x: 150, y: 130 });
    expect(moved).toMatchObject({ kind: "panning", offset: { x: 50, y: 30 } });
    expect(endPan(moved)).toEqual({ kind: "zoomed", offset: { x: 50, y: 30 } });
  });

  it("keeps the previous offset as the pan origin", () => {
    const zoomed = { kind: "zoomed", offset: { x: 20, y: 5 } } as const;
    const panning = beginPan(zoomed, { x: 100, y: 100 });
    expect(panning).toMatchObject({ origin: { x: 80, y: 95 } });
    // movePan from the same touch point leaves the offset unchanged
    expect(movePan(panning, { x: 100, y: 100 })).toMatchObject({
      offset: { x: 20, y: 5 },
    });
  });

  it("endPan is a no-op outside panning and movePan ignores zoomed", () => {
    expect(endPan(rest)).toEqual(rest);
    const zoomed = toggleZoom(rest);
    expect(endPan(zoomed)).toEqual(zoomed);
    expect(movePan(zoomed, { x: 1, y: 1 })).toEqual(zoomed);
  });

  it("zoomStyle reflects each state", () => {
    expect(zoomStyle(rest)).toMatchObject({
      transform: "translate(0px, 0px) scale(1)",
      cursor: "zoom-in",
      transition: "transform 0.2s ease",
    });
    const panning = movePan(beginPan(toggleZoom(rest), { x: 0, y: 0 }), {
      x: 4,
      y: 6,
    });
    expect(zoomStyle(panning)).toMatchObject({
      transform: `translate(4px, 6px) scale(${ZOOM_SCALE})`,
      transition: "none",
      cursor: "grab",
      touchAction: "none",
    });
    expect(isZoomed(rest)).toBe(false);
    expect(isZoomed(panning)).toBe(true);
  });
});

describe("tap timeline", () => {
  it("detects a double tap and resets afterwards", () => {
    const first = registerTap(noTaps, 1000);
    expect(first.doubleTap).toBe(false);
    const second = registerTap(first.timeline, 1100);
    expect(second.doubleTap).toBe(true);
    expect(second.timeline.lastTapAt).toBe(0);
    expect(second.timeline.lastTouchToggleAt).toBe(1100);
    // a third tap right after is a fresh first tap, not a double
    expect(registerTap(second.timeline, 1150).doubleTap).toBe(false);
  });

  it("two slow taps are not a double tap", () => {
    const first = registerTap(noTaps, 1000);
    expect(registerTap(first.timeline, 1500).doubleTap).toBe(false);
  });

  it("flags the browser's synthesized dblclick as a ghost click", () => {
    const toggled = registerTap(registerTap(noTaps, 1000).timeline, 1100);
    expect(isGhostClick(toggled.timeline, 1150)).toBe(true);
    expect(isGhostClick(toggled.timeline, 1900)).toBe(false);
    expect(isGhostClick(noTaps, 100)).toBe(true);
    expect(isGhostClick(noTaps, 5000)).toBe(false);
  });
});
