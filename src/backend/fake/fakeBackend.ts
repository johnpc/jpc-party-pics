import { Backend, ImageRecord } from "../types";
import { FakeStore } from "./fakeStore";
import { seedState } from "./fakeSeed";

export const FAKE_S3_PREFIX = "/fake-s3/";

export interface FakeBackend extends Backend {
  /** Test hook: inject an image as if another guest uploaded it. */
  injectImage(albumName: string, imageKey: string): void;
}

// Uploaded blobs live only in memory (object URLs); seeded keys are served by
// the dev-server middleware. Both look like real S3 to the components.
export function createFakeBackend(
  store: FakeStore = new FakeStore(
    seedState(),
    typeof localStorage === "undefined" ? null : localStorage,
  ),
  origin: string = typeof location === "undefined" ? "" : location.origin,
): FakeBackend {
  const uploaded = new Map<string, { url: string; size: number }>();
  const generated = new Set<string>();

  const record = (key: string, size: number): ImageRecord => ({
    key,
    size,
    date: new Date().toISOString(),
  });

  const backend: FakeBackend = {
    async listAlbums() {
      return store.albums();
    },
    async createAlbum(albumName) {
      store.addAlbum(albumName);
    },
    async listImages(albumName) {
      return store.images(albumName);
    },
    async registerImage(albumName, imageKey) {
      store.addImage(
        albumName,
        record(imageKey, uploaded.get(imageKey)?.size ?? 0),
      );
    },
    async deleteImage(imageKey) {
      uploaded.delete(imageKey);
      store.removeImage(imageKey);
    },
    onImageCreated(listener) {
      return store.onCreated(listener);
    },
    onImageDeleted(listener) {
      return store.onDeleted(listener);
    },
    async getUrl(path, options) {
      const local = uploaded.get(path) ?? uploaded.get(fullKeyOf(path));
      if (local) return new URL(local.url);
      const exists =
        generated.has(path) ||
        store.hasKey(path) ||
        store.hasKey(fullKeyOf(path));
      if (options.validateObjectExistence && !exists) {
        throw new Error(`NotFound: ${path}`);
      }
      return new URL(`${FAKE_S3_PREFIX}${path}`, origin);
    },
    async upload(path, data, options) {
      options?.onProgress?.(data.size, data.size);
      uploaded.set(path, { url: URL.createObjectURL(data), size: data.size });
    },
    async requestZip(albumName) {
      const key = `generated/${albumName}-fake.zip`;
      generated.add(key);
      return { key };
    },
    injectImage(albumName, imageKey) {
      store.addImage(albumName, record(imageKey, 123_456));
    },
  };

  return backend;
}

// thumbnails/<album>/<rest> mirrors public/<album>/<rest>
function fullKeyOf(path: string): string {
  return path.replace(/^thumbnails\//, "public/");
}
