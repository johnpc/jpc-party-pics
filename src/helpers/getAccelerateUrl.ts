import { getUrl } from "aws-amplify/storage";

export const getAccelerateUrl = async (key: string): Promise<URL> => {
  const url = await getUrl({
    path: key,
    options: {
      validateObjectExistence: false,
      expiresIn: 3600,
      useAccelerateEndpoint: true,
    },
  });
  return url.url;
};
