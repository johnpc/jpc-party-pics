import { backend } from "../backend";

export const getAccelerateUrl = (key: string): Promise<URL> =>
  backend.getUrl(key, { validateObjectExistence: false, expiresIn: 3600 });
