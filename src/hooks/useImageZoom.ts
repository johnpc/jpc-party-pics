import { useRef, useState } from "react";
import {
  Point,
  TapTimeline,
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
} from "../helpers/imageZoom";

const pointOf = (touch: { clientX: number; clientY: number }): Point => ({
  x: touch.clientX,
  y: touch.clientY,
});

// Double-tap (or double-click) toggles a fixed zoom; while zoomed the image can
// be dragged to pan. Touch events are swallowed while zoomed so the parent
// swipe-navigation handler doesn't fire mid-pan.
export function useImageZoom() {
  const [state, setState] = useState(rest);
  const taps = useRef<TapTimeline>(noTaps);
  const zoomed = isZoomed(state);

  // Mouse-only entry point. A touch double-tap synthesizes a trailing dblclick,
  // which would immediately undo the touch toggle — swallow that ghost click.
  const onDoubleClick = () => {
    if (isGhostClick(taps.current, Date.now())) return;
    setState(toggleZoom);
  };

  const onTouchStart = (event: React.TouchEvent) => {
    if (!zoomed) return;
    event.stopPropagation();
    setState((s) => beginPan(s, pointOf(event.touches[0])));
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (!zoomed) return;
    event.stopPropagation();
    setState((s) => movePan(s, pointOf(event.touches[0])));
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const tap = registerTap(taps.current, Date.now());
    taps.current = tap.timeline;
    setState(endPan);
    if (!tap.doubleTap) return;
    event.stopPropagation();
    setState(toggleZoom);
  };

  return {
    zoomed,
    style: zoomStyle(state),
    onDoubleClick,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
