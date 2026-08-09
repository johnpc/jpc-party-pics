export const ZOOM_SCALE = 2.5;
export const DOUBLE_TAP_MS = 300;
// A touch double-tap makes the browser synthesize a trailing double click;
// ignore double clicks that land within this window of a touch-driven toggle.
export const GHOST_CLICK_MS = 700;

export interface Point {
  x: number;
  y: number;
}

export function isDoubleTap(sinceLast: number): boolean {
  return sinceLast > 0 && sinceLast < DOUBLE_TAP_MS;
}

export function isGhostClick(sinceTouchToggle: number): boolean {
  return sinceTouchToggle < GHOST_CLICK_MS;
}

export function panOrigin(
  touch: { clientX: number; clientY: number },
  offset: Point,
): Point {
  return { x: touch.clientX - offset.x, y: touch.clientY - offset.y };
}

export function panOffset(
  touch: { clientX: number; clientY: number },
  origin: Point,
): Point {
  return { x: touch.clientX - origin.x, y: touch.clientY - origin.y };
}

export function zoomStyle(
  scale: number,
  offset: Point,
  dragging: boolean,
): React.CSSProperties {
  const zoomed = scale > 1;
  return {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
    transition: dragging ? "none" : "transform 0.2s ease",
    cursor: zoomed ? "grab" : "zoom-in",
    touchAction: zoomed ? "none" : undefined,
  };
}
