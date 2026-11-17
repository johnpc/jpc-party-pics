// @state-machine lightbox
// The photo modal is closed or open on a KEY. The image itself is derived from
// the live list every render, so a photo deleted by another guest closes the
// lightbox instead of leaving a stale copy on screen.
export type Lightbox = { kind: "closed" } | { kind: "open"; key: string };

export const closed: Lightbox = { kind: "closed" };

export const open = (key: string): Lightbox => ({ kind: "open", key });

export function neighborKey(
  keys: string[],
  key: string,
  direction: "back" | "forward",
): string | undefined {
  const index = keys.indexOf(key);
  if (index === -1 || keys.length === 0) return undefined;
  const step = direction === "forward" ? 1 : -1;
  return keys[(index + step + keys.length) % keys.length];
}
