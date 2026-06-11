const testVideo =
  typeof document !== "undefined" ? document.createElement("video") : null;

const supportCache = new Map<string, boolean>();

export function canPlayVideoFile(fileName: string): boolean {
  if (!testVideo) return false;

  const ext = fileName.toLowerCase().split(".").pop();
  if (!ext) return false;

  if (supportCache.has(ext)) return supportCache.get(ext)!;

  const mimeMap: Record<string, string> = {
    mp4: "video/mp4",
    mov: "video/mp4",
    webm: "video/webm",
    mkv: 'video/x-matroska; codecs="avc1"',
    avi: "video/x-msvideo",
    wmv: "video/x-ms-wmv",
    flv: "video/x-flv",
  };

  const mime = mimeMap[ext];
  if (!mime) {
    supportCache.set(ext, false);
    return false;
  }

  const result = testVideo.canPlayType(mime) !== "";
  supportCache.set(ext, result);
  return result;
}
