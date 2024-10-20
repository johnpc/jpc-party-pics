export function detectFileType(
  fileName: string,
): "image" | "video" | "unknown" {
  const lowerCaseFileName = fileName.toLowerCase();

  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".svg",
  ];
  const videoExtensions = [
    ".mp4",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".mkv",
    ".webm",
  ];

  // Check if the file name ends with any of the image extensions
  if (imageExtensions.some((ext) => lowerCaseFileName.endsWith(ext))) {
    return "image";
  }

  // Check if the file name ends with any of the video extensions
  if (videoExtensions.some((ext) => lowerCaseFileName.endsWith(ext))) {
    return "video";
  }

  // If no match is found, return 'unknown'
  return "unknown";
}
