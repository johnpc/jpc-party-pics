import { uploadData } from "aws-amplify/storage";
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

  await uploadData({
    path: key,
    data: compressed,
    options: { useAccelerateEndpoint: true },
  }).result;

  return key;
}

export interface VideoUploadResult {
  key: string;
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

  await uploadData({
    path: key,
    data: file,
    options: { useAccelerateEndpoint: true },
  }).result;

  return key;
}
