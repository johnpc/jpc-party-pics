import { useRef, useState } from "react";

const ZOOM_SCALE = 2.5;
const DOUBLE_TAP_MS = 300;

// Double-tap (or double-click) toggles a fixed zoom; while zoomed the image can
// be dragged to pan. Touch events are swallowed while zoomed so the parent
// swipe-navigation handler doesn't fire mid-pan.
export function useImageZoom() {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastTap = useRef(0);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const zoomed = scale > 1;

  const toggle = () => {
    setOffset({ x: 0, y: 0 });
    setScale(zoomed ? 1 : ZOOM_SCALE);
  };

  const onTouchStart = (event: React.TouchEvent) => {
    if (!zoomed) return;
    event.stopPropagation();
    const touch = event.touches[0];
    dragStart.current = {
      x: touch.clientX - offset.x,
      y: touch.clientY - offset.y,
    };
    setDragging(true);
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (!zoomed || !dragStart.current) return;
    event.stopPropagation();
    const touch = event.touches[0];
    setOffset({
      x: touch.clientX - dragStart.current.x,
      y: touch.clientY - dragStart.current.y,
    });
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const now = Date.now();
    const sinceLast = now - lastTap.current;
    lastTap.current = now;
    dragStart.current = null;
    setDragging(false);

    if (sinceLast > 0 && sinceLast < DOUBLE_TAP_MS) {
      event.stopPropagation();
      lastTap.current = 0;
      toggle();
    } else if (zoomed) {
      event.stopPropagation();
    }
  };

  const style: React.CSSProperties = {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
    transition: dragging ? "none" : "transform 0.2s ease",
    cursor: zoomed ? "grab" : "zoom-in",
    touchAction: zoomed ? "none" : undefined,
  };

  return {
    zoomed,
    style,
    onDoubleClick: toggle,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
