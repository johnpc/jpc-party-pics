// @state-machine route
// The URL is the one owner of "which screen": derive it, never store it.
export type Route =
  | { kind: "home" }
  | { kind: "album"; albumName: string }
  | { kind: "camera"; albumName: string }
  | { kind: "kiosk"; albumName: string };

export function parseRoute(pathname: string): Route {
  const [albumName, view] = pathname.split("/").filter(Boolean);
  if (!albumName) return { kind: "home" };
  if (view === "camera") return { kind: "camera", albumName };
  if (view === "kiosk") return { kind: "kiosk", albumName };
  return { kind: "album", albumName };
}
