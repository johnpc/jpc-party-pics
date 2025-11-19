import imageCompression from "browser-image-compression";

const MAX_SIZE_MB = 1.5;
const MAX_WIDTH_PX = 1920;
const QUALITY = 0.85;

export const compressMedia = async (file: File): Promise<File> => {
  // Skip compression for videos
  if (file.type.startsWith("video/")) {
    return file;
  }

  // Skip if already small enough
  if (file.size < MAX_SIZE_MB * 1024 * 1024) {
    return file;
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: MAX_WIDTH_PX,
      useWebWorker: true,
      initialQuality: QUALITY,
      fileType: file.type,
    });

    console.log(
      `Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressed.size / 1024 / 1024).toFixed(2)}MB`,
    );

    return compressed;
  } catch (error) {
    console.warn("Compression failed, using original:", error);
    return file;
  }
};
