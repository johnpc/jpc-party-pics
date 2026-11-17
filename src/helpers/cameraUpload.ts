import { backend } from "../backend";
import { compressMedia } from "./compressMedia";

const MIN_VIDEO_SIZE = 50_000;

export async function uploadPhoto(
  blob: Blob,
  albumName: string,
  hash: string,
): Promise<string> {
  const file = new File([blob], `photo-${Date.now()}.jpg`, {
    type: "image/jpeg",
  });
  const { file: compressed, key } = await compressMedia({
    file,
    key: `public/${albumName}/${hash}/${file.name}`,
  });

  await backend.upload(key, compressed);
  return key;
}

export function isVideoTooShort(blob: Blob): boolean {
  return blob.size < MIN_VIDEO_SIZE;
}

export async function uploadVideo(
  blob: Blob,
  mimeType: string,
  ext: string,
  albumName: string,
  hash: string,
): Promise<string> {
  const file = new File([blob], `video-${Date.now()}.${ext}`, {
    type: mimeType,
  });
  const key = `public/${albumName}/${hash}/${file.name}`;

  await backend.upload(key, file);
  return key;
}
