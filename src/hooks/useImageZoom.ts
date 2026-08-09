import { useRef, useState } from "react";
import {
  Point,
  ZOOM_SCALE,
  isDoubleTap,
  isGhostClick,
  panOrigin,
  panOffset,
  zoomStyle,
} from "../helpers/imageZoom";

// Double-tap (or double-click) toggles a fixed zoom; while zoomed the image can
// be dragged to pan. Touch events are swallowed while zoomed so the parent
// swipe-navigation handler doesn't fire mid-pan.
export function useImageZoom() {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastTap = useRef(0);
  const lastTouchToggle = useRef(0);
  const dragStart = useRef<Point | null>(null);

  const zoomed = scale > 1;

  const toggle = () => {
    setOffset({ x: 0, y: 0 });
    setScale(zoomed ? 1 : ZOOM_SCALE);
  };

  // Mouse-only entry point. A touch double-tap synthesizes a trailing dblclick,
  // which would immediately undo the touch toggle — swallow that ghost click.
  const onDoubleClick = () => {
    if (isGhostClick(Date.now() - lastTouchToggle.current)) return;
    toggle();
  };

  const onTouchStart = (event: React.TouchEvent) => {
    if (!zoomed) return;
    event.stopPropagation();
    dragStart.current = panOrigin(event.touches[0], offset);
    setDragging(true);
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (!zoomed || !dragStart.current) return;
    event.stopPropagation();
    setOffset(panOffset(event.touches[0], dragStart.current));
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const sinceLast = Date.now() - lastTap.current;
    lastTap.current = Date.now();
    dragStart.current = null;
    setDragging(false);

    if (!isDoubleTap(sinceLast)) return;
    event.stopPropagation();
    lastTap.current = 0;
    lastTouchToggle.current = Date.now();
    toggle();
  };

  return {
    zoomed,
    style: zoomStyle(scale, offset, dragging),
    onDoubleClick,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
