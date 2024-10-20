import { getUrl } from "aws-amplify/storage";

export const getAccelerateUrl = async (key: string): Promise<URL> => {
  const url = await getUrl({
    path: key,
    options: {
      // ensure object exists before getting url
      validateObjectExistence: false,
      // url expiration time in seconds.
      expiresIn: 300,
      // whether to use accelerate endpoint
      useAccelerateEndpoint: true,
    },
  });
  return url.url;
};
