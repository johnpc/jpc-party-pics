import { getUrl } from "aws-amplify/storage";

export const getThumbnailUrl = async (key: string): Promise<URL> => {
  const thumbnailKey = `thumbnails/${key.replace(/^public\//, "")}`;
  const url = await getUrl({
    path: thumbnailKey,
    options: {
      validateObjectExistence: true,
      expiresIn: 3600,
      useAccelerateEndpoint: true,
    },
  });
  return url.url;
};
