import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import { getUrl, uploadData } from "aws-amplify/storage";
import { Schema } from "../../../amplify/data/resource";
import { amplifyOutputs, zipFileEndpoint } from "./outputs";
import { Backend, ImageEvent, UploadOptions, UrlOptions } from "../types";

type AmplifyClient = ReturnType<typeof generateClient<Schema>>;

function subscribe(
  source: {
    subscribe: (h: { next: (e: ImageEvent) => void }) => {
      unsubscribe: () => void;
    };
  },
  listener: (event: ImageEvent) => void,
) {
  const sub = source.subscribe({ next: listener });
  return () => sub.unsubscribe();
}

function uploadOptions(options?: UploadOptions) {
  const base = { useAccelerateEndpoint: true };
  if (!options?.onProgress) return base;
  const report = options.onProgress;
  return {
    ...base,
    onProgress: (e: { transferredBytes: number; totalBytes?: number }) =>
      report(e.transferredBytes, e.totalBytes),
  };
}

export function createAmplifyBackend(
  client: AmplifyClient = generateClient<Schema>(),
): Backend {
  return {
    async listAlbums() {
      const response = await client.models.Albums.list();
      return response.data ?? [];
    },
    async createAlbum(albumName) {
      const result = await client.models.Albums.create({ albumName });
      if (result.errors) throw new Error("Failed to create album");
    },
    async listImages(albumName) {
      const response = await client.queries.getPartyPicsImages({ albumName });
      return response.data?.images ?? [];
    },
    async registerImage(albumName, imageKey) {
      await client.models.AlbumImageKey.create({ imageKey, albumName });
    },
    async deleteImage(imageKey) {
      await client.queries.deletePartyPic({ key: imageKey });
      await client.models.AlbumImageKey.delete({ imageKey });
    },
    onImageCreated(listener) {
      return subscribe(client.models.AlbumImageKey.onCreate(), listener);
    },
    onImageDeleted(listener) {
      return subscribe(client.models.AlbumImageKey.onDelete(), listener);
    },
    async getUrl(path, options: UrlOptions) {
      const result = await getUrl({
        path,
        options: { ...options, useAccelerateEndpoint: true },
      });
      return result.url;
    },
    async upload(path, data, options) {
      await uploadData({ path, data, options: uploadOptions(options) }).result;
    },
    async requestZip(albumName) {
      const response = await fetch(zipFileEndpoint, {
        method: "POST",
        body: JSON.stringify({ albumName }),
      });
      const result = await response.json();
      return { key: result.key ?? result.data!.key };
    },
  };
}

export function configureAmplify(): void {
  Amplify.configure(amplifyOutputs as Parameters<typeof Amplify.configure>[0]);
}
