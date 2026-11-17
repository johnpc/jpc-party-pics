import { useEffect, useRef, useState } from "react";

// @state-machine in-view
// One-shot latch: false → true the first time the element intersects, then
// the observer disconnects so it can never flip back.
export function useInView(rootMargin = "200px"): {
  ref: React.RefObject<HTMLDivElement | null>;
  inView: boolean;
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
