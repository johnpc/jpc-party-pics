import { backend } from "../backend";

export const getThumbnailUrl = (key: string): Promise<URL> => {
  const thumbnailKey = `thumbnails/${key.replace(/^public\//, "")}`;
  return backend.getUrl(thumbnailKey, {
    validateObjectExistence: true,
    expiresIn: 3600,
  });
};
