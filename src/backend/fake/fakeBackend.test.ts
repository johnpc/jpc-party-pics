import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeBackend, FAKE_S3_PREFIX } from "./fakeBackend";
import { FakeStore } from "./fakeStore";

const ORIGIN = "http://localhost:5173";

function backend() {
  const store = new FakeStore(
    {
      albums: [{ albumName: "Demo" }],
      images: {
        Demo: [{ key: "public/Demo/seed/a.jpg", size: 10, date: "d" }],
      },
    },
    null,
  );
  return createFakeBackend(store, ORIGIN);
}

describe("fakeBackend", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", URL);
    URL.createObjectURL = vi.fn(() => "blob:http://localhost/abc");
  });

  it("lists, creates albums and lists images", async () => {
    const b = backend();
    expect(await b.listAlbums()).toEqual([{ albumName: "Demo" }]);
    await b.createAlbum("party");
    expect(await b.listAlbums()).toHaveLength(2);
    expect(await b.listImages("Demo")).toHaveLength(1);
  });

  it("serves seeded keys from the fake-S3 prefix", async () => {
    const b = backend();
    const url = await b.getUrl("public/Demo/seed/a.jpg", {
      validateObjectExistence: true,
      expiresIn: 60,
    });
    expect(url.toString()).toBe(
      `${ORIGIN}${FAKE_S3_PREFIX}public/Demo/seed/a.jpg`,
    );
  });

  it("treats a thumbnail path as existing when its full key exists", async () => {
    const b = backend();
    const url = await b.getUrl("thumbnails/Demo/seed/a.jpg", {
      validateObjectExistence: true,
      expiresIn: 60,
    });
    expect(url.pathname).toBe(`${FAKE_S3_PREFIX}thumbnails/Demo/seed/a.jpg`);
  });

  it("rejects validated URLs for unknown keys but not unchecked ones", async () => {
    const b = backend();
    await expect(
      b.getUrl("public/Demo/nope.jpg", {
        validateObjectExistence: true,
        expiresIn: 60,
      }),
    ).rejects.toThrow(/NotFound/);
    const url = await b.getUrl("generated/x.zip", {
      validateObjectExistence: false,
      expiresIn: 60,
    });
    expect(url.pathname).toBe(`${FAKE_S3_PREFIX}generated/x.zip`);
  });

  it("upload reports progress, then register publishes the image", async () => {
    const b = backend();
    const onProgress = vi.fn();
    const created = vi.fn();
    b.onImageCreated(created);
    const blob = new Blob([new Uint8Array(42)]);
    await b.upload("public/Demo/h/new.jpg", blob, { onProgress });
    expect(onProgress).toHaveBeenCalledWith(42, 42);
    await b.registerImage("Demo", "public/Demo/h/new.jpg");
    const images = await b.listImages("Demo");
    expect(images[0]).toMatchObject({ key: "public/Demo/h/new.jpg", size: 42 });
    expect(created).toHaveBeenCalledWith({
      albumName: "Demo",
      imageKey: "public/Demo/h/new.jpg",
    });
    const url = await b.getUrl("public/Demo/h/new.jpg", {
      validateObjectExistence: true,
      expiresIn: 60,
    });
    expect(url.toString()).toBe("blob:http://localhost/abc");
    // the thumbnail lookup for an upload resolves to the same blob
    const thumb = await b.getUrl("thumbnails/Demo/h/new.jpg", {
      validateObjectExistence: true,
      expiresIn: 60,
    });
    expect(thumb.toString()).toBe("blob:http://localhost/abc");
  });

  it("upload without progress callback still succeeds", async () => {
    const b = backend();
    await expect(
      b.upload("public/Demo/h/x.jpg", new Blob(["x"])),
    ).resolves.toBeUndefined();
  });

  it("deleteImage removes the record and notifies", async () => {
    const b = backend();
    const deleted = vi.fn();
    const unsubscribe = b.onImageDeleted(deleted);
    await b.deleteImage("public/Demo/seed/a.jpg");
    expect(await b.listImages("Demo")).toEqual([]);
    expect(deleted).toHaveBeenCalledWith({
      albumName: "Demo",
      imageKey: "public/Demo/seed/a.jpg",
    });
    unsubscribe();
  });

  it("requestZip returns a generated key and injectImage simulates a guest", async () => {
    const b = backend();
    expect(await b.requestZip("Demo")).toEqual({
      key: "generated/Demo-fake.zip",
    });
    const zipUrl = await b.getUrl("generated/Demo-fake.zip", {
      validateObjectExistence: true,
      expiresIn: 60,
    });
    expect(zipUrl.pathname).toBe(`${FAKE_S3_PREFIX}generated/Demo-fake.zip`);
    b.injectImage("Demo", "public/Demo/guest/g.jpg");
    expect((await b.listImages("Demo"))[0].key).toBe("public/Demo/guest/g.jpg");
  });

  it("seeds itself and uses the page origin by default", async () => {
    const b = createFakeBackend();
    const albums = await b.listAlbums();
    expect(albums.map((a) => a.albumName)).toContain("Demo");
    const url = await b.getUrl("public/Demo/seed/demo-01.jpg", {
      validateObjectExistence: false,
      expiresIn: 1,
    });
    expect(url.origin).toBe(location.origin);
  });
});
