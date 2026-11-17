import { useEffect, useState } from "react";

// @state-machine transient-flag
// off → on (trigger) → off after `durationMs`. The timer is owned by the
// effect, so a re-trigger restarts it and unmount cancels it — no stray
// setTimeout can flip a flag on a component that is gone.
export function useTransientFlag(durationMs: number): [boolean, () => void] {
  const [firedAt, setFiredAt] = useState<number | null>(null);

  useEffect(() => {
    if (firedAt === null) return;
    const timer = setTimeout(() => setFiredAt(null), durationMs);
    return () => clearTimeout(timer);
  }, [firedAt, durationMs]);

  return [firedAt !== null, () => setFiredAt(Date.now())];
}
