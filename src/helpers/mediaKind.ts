import { detectFileType } from "./detectFileType";
import { canPlayVideoFile } from "./videoSupport";

// @state-machine media-kind
// How a stored key renders: one classifier shared by the gallery, the kiosk
// and the lightbox. An unknown extension is handed to <video> (the browser
// sniffs the container) — the historical behavior, kept on purpose.
export type MediaKind = "image" | "video" | "unsupported-video";

export function mediaKind(key: string): MediaKind {
  const fileType = detectFileType(key);
  if (fileType === "image") return "image";
  if (fileType === "video" && !canPlayVideoFile(key))
    return "unsupported-video";
  return "video";
}
