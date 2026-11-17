// @state-machine image-zoom
// rest ⇄ zoomed (double-tap/double-click) ; zoomed ⇄ panning (touch drag).
// One value owns scale + offset + drag, so "scale 1 with an offset" or
// "dragging while not zoomed" cannot be represented.
export const ZOOM_SCALE = 2.5;
export const DOUBLE_TAP_MS = 300;
// A touch double-tap makes the browser synthesize a trailing double click;
// ignore double clicks that land within this window of a touch-driven toggle.
export const GHOST_CLICK_MS = 700;

export interface Point {
  x: number;
  y: number;
}

export type ZoomState =
  | { kind: "rest" }
  | { kind: "zoomed"; offset: Point }
  | { kind: "panning"; offset: Point; origin: Point };

export const rest: ZoomState = { kind: "rest" };
const ORIGIN: Point = { x: 0, y: 0 };

export function toggleZoom(state: ZoomState): ZoomState {
  return state.kind === "rest" ? { kind: "zoomed", offset: ORIGIN } : rest;
}

export function beginPan(state: ZoomState, touch: Point): ZoomState {
  if (state.kind === "rest") return state;
  const origin = { x: touch.x - state.offset.x, y: touch.y - state.offset.y };
  return { kind: "panning", offset: state.offset, origin };
}

export function movePan(state: ZoomState, touch: Point): ZoomState {
  if (state.kind !== "panning") return state;
  const offset = { x: touch.x - state.origin.x, y: touch.y - state.origin.y };
  return { ...state, offset };
}

export function endPan(state: ZoomState): ZoomState {
  return state.kind === "panning"
    ? { kind: "zoomed", offset: state.offset }
    : state;
}

export function isZoomed(state: ZoomState): boolean {
  return state.kind !== "rest";
}

export function zoomStyle(state: ZoomState): React.CSSProperties {
  const zoomed = isZoomed(state);
  const offset = state.kind === "rest" ? ORIGIN : state.offset;
  return {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomed ? ZOOM_SCALE : 1})`,
    transition: state.kind === "panning" ? "none" : "transform 0.2s ease",
    cursor: zoomed ? "grab" : "zoom-in",
    touchAction: zoomed ? "none" : undefined,
  };
}

// Tap timing: a second tap within DOUBLE_TAP_MS is a double tap; a dblclick
// within GHOST_CLICK_MS of a touch toggle is the browser's echo of it.
export interface TapTimeline {
  lastTapAt: number;
  lastTouchToggleAt: number;
}

export const noTaps: TapTimeline = { lastTapAt: 0, lastTouchToggleAt: 0 };

export function registerTap(
  timeline: TapTimeline,
  now: number,
): { timeline: TapTimeline; doubleTap: boolean } {
  const sinceLast = now - timeline.lastTapAt;
  const doubleTap = timeline.lastTapAt > 0 && sinceLast < DOUBLE_TAP_MS;
  return {
    doubleTap,
    timeline: {
      lastTapAt: doubleTap ? 0 : now,
      lastTouchToggleAt: doubleTap ? now : timeline.lastTouchToggleAt,
    },
  };
}

export function isGhostClick(timeline: TapTimeline, now: number): boolean {
  return now - timeline.lastTouchToggleAt < GHOST_CLICK_MS;
}
