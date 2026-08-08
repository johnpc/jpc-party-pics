import { useRef } from "react";

const SWIPE_THRESHOLD = 50; // px of horizontal travel to count as a swipe

// Returns touch handlers that fire onSwipeLeft/onSwipeRight when the user
// drags horizontally past the threshold. Vertical-dominant drags are ignored.
export function useSwipeNavigation(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    start.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (!start.current) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.current.x;
    const deltaY = touch.clientY - start.current.y;
    start.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

    if (deltaX < 0) onSwipeLeft();
    else onSwipeRight();
  };

  return { onTouchStart, onTouchEnd };
}
