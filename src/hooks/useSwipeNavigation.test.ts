import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSwipeNavigation } from "./useSwipeNavigation";

type Point = { clientX: number; clientY: number };

function touch(touches: Point, changed: Point) {
  return {
    touches: [touches],
    changedTouches: [changed],
  } as unknown as React.TouchEvent;
}

function setup() {
  const onLeft = vi.fn();
  const onRight = vi.fn();
  const { result } = renderHook(() => useSwipeNavigation(onLeft, onRight));
  return { onLeft, onRight, handlers: result.current };
}

describe("useSwipeNavigation", () => {
  it("fires onSwipeLeft when dragging left past threshold", () => {
    const { onLeft, onRight, handlers } = setup();
    handlers.onTouchStart(
      touch({ clientX: 200, clientY: 100 }, { clientX: 200, clientY: 100 }),
    );
    handlers.onTouchEnd(
      touch({ clientX: 200, clientY: 100 }, { clientX: 100, clientY: 105 }),
    );
    expect(onLeft).toHaveBeenCalledTimes(1);
    expect(onRight).not.toHaveBeenCalled();
  });

  it("fires onSwipeRight when dragging right past threshold", () => {
    const { onLeft, onRight, handlers } = setup();
    handlers.onTouchStart(
      touch({ clientX: 100, clientY: 100 }, { clientX: 100, clientY: 100 }),
    );
    handlers.onTouchEnd(
      touch({ clientX: 100, clientY: 100 }, { clientX: 220, clientY: 95 }),
    );
    expect(onRight).toHaveBeenCalledTimes(1);
    expect(onLeft).not.toHaveBeenCalled();
  });

  it("ignores short horizontal movement below threshold", () => {
    const { onLeft, onRight, handlers } = setup();
    handlers.onTouchStart(
      touch({ clientX: 100, clientY: 100 }, { clientX: 100, clientY: 100 }),
    );
    handlers.onTouchEnd(
      touch({ clientX: 100, clientY: 100 }, { clientX: 120, clientY: 100 }),
    );
    expect(onLeft).not.toHaveBeenCalled();
    expect(onRight).not.toHaveBeenCalled();
  });

  it("ignores vertical-dominant drags", () => {
    const { onLeft, onRight, handlers } = setup();
    handlers.onTouchStart(
      touch({ clientX: 100, clientY: 100 }, { clientX: 100, clientY: 100 }),
    );
    handlers.onTouchEnd(
      touch({ clientX: 100, clientY: 100 }, { clientX: 160, clientY: 300 }),
    );
    expect(onLeft).not.toHaveBeenCalled();
    expect(onRight).not.toHaveBeenCalled();
  });

  it("does nothing on touch end without a start", () => {
    const { onLeft, onRight, handlers } = setup();
    handlers.onTouchEnd(
      touch({ clientX: 100, clientY: 100 }, { clientX: 0, clientY: 100 }),
    );
    expect(onLeft).not.toHaveBeenCalled();
    expect(onRight).not.toHaveBeenCalled();
  });
});
