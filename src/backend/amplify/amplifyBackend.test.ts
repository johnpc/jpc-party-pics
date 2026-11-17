import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAmplifyBackend, configureAmplify } from "./amplifyBackend";
import { getUrl, uploadData } from "aws-amplify/storage";
import { Amplify } from "aws-amplify";

vi.mock("aws-amplify/storage", () => ({
  getUrl: vi.fn(),
  uploadData: vi.fn(),
}));

const unsubscribe = vi.fn();
const subscriptions: Array<(e: unknown) => void> = [];
const source = () => ({
  subscribe: (h: { next: (e: unknown) => void }) => {
    subscriptions.push(h.next);
    return { unsubscribe };
  },
});

const client = {
  models: {
    Albums: { list: vi.fn(), create: vi.fn() },
    AlbumImageKey: {
      create: vi.fn(),
      delete: vi.fn(),
      onCreate: source,
      onDelete: source,
    },
  },
  queries: { getPartyPicsImages: vi.fn(), deletePartyPic: vi.fn() },
};

type Client = Parameters<typeof createAmplifyBackend>[0];
const backend = () => createAmplifyBackend(client as unknown as Client);

describe("amplifyBackend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subscriptions.length = 0;
  });

  it("lists albums (null data → empty) and creates them", async () => {
    client.models.Albums.list.mockResolvedValue({ data: null });
    expect(await backend().listAlbums()).toEqual([]);
    client.models.Albums.list.mockResolvedValue({ data: [{ albumName: "a" }] });
    expect(await backend().listAlbums()).toEqual([{ albumName: "a" }]);

    client.models.Albums.create.mockResolvedValue({ errors: null });
    await backend().createAlbum("party");
    expect(client.models.Albums.create).toHaveBeenCalledWith({
      albumName: "party",
    });
    client.models.Albums.create.mockResolvedValue({ errors: [{}] });
    await expect(backend().createAlbum("bad")).rejects.toThrow(
      "Failed to create album",
    );
  });

  it("lists, registers and deletes images", async () => {
    client.queries.getPartyPicsImages.mockResolvedValue({ data: null });
    expect(await backend().listImages("a")).toEqual([]);
    client.queries.getPartyPicsImages.mockResolvedValue({
      data: { images: [{ key: "k", size: 1, date: "d" }] },
    });
    expect(await backend().listImages("a")).toHaveLength(1);

    await backend().registerImage("a", "k");
    expect(client.models.AlbumImageKey.create).toHaveBeenCalledWith({
      imageKey: "k",
      albumName: "a",
    });

    await backend().deleteImage("k");
    expect(client.queries.deletePartyPic).toHaveBeenCalledWith({ key: "k" });
    expect(client.models.AlbumImageKey.delete).toHaveBeenCalledWith({
      imageKey: "k",
    });
  });

  it("wires subscriptions and unsubscribes", () => {
    const created = vi.fn();
    const deleted = vi.fn();
    const stopCreated = backend().onImageCreated(created);
    const stopDeleted = backend().onImageDeleted(deleted);
    subscriptions[0]({ albumName: "a", imageKey: "k" });
    subscriptions[1]({ albumName: "a", imageKey: "k" });
    expect(created).toHaveBeenCalledWith({ albumName: "a", imageKey: "k" });
    expect(deleted).toHaveBeenCalledWith({ albumName: "a", imageKey: "k" });
    stopCreated();
    stopDeleted();
    expect(unsubscribe).toHaveBeenCalledTimes(2);
  });

  it("signs URLs through the accelerate endpoint", async () => {
    const url = new URL("https://x/y");
    vi.mocked(getUrl).mockResolvedValue({ url } as never);
    const result = await backend().getUrl("p", {
      validateObjectExistence: true,
      expiresIn: 300,
    });
    expect(result).toBe(url);
    expect(getUrl).toHaveBeenCalledWith({
      path: "p",
      options: {
        validateObjectExistence: true,
        expiresIn: 300,
        useAccelerateEndpoint: true,
      },
    });
  });

  it("uploads with and without progress reporting", async () => {
    vi.mocked(uploadData).mockReturnValue({
      result: Promise.resolve({}),
    } as never);
    const blob = new Blob(["x"]);
    await backend().upload("p", blob);
    expect(uploadData).toHaveBeenCalledWith({
      path: "p",
      data: blob,
      options: { useAccelerateEndpoint: true },
    });

    const onProgress = vi.fn();
    await backend().upload("p", blob, { onProgress });
    const call = vi.mocked(uploadData).mock.calls[1][0] as {
      options: { onProgress: (e: unknown) => void };
    };
    call.options.onProgress({ transferredBytes: 5, totalBytes: 10 });
    expect(onProgress).toHaveBeenCalledWith(5, 10);
  });

  it("requests a zip via the function URL, accepting both response shapes", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ json: async () => ({ key: "generated/a.zip" }) })
      .mockResolvedValueOnce({
        json: async () => ({ data: { key: "generated/b.zip" } }),
      });
    vi.stubGlobal("fetch", fetchMock);
    expect(await backend().requestZip("a")).toEqual({ key: "generated/a.zip" });
    expect(await backend().requestZip("b")).toEqual({ key: "generated/b.zip" });
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {
      method: "POST",
      body: JSON.stringify({ albumName: "a" }),
    });
  });

  it("configureAmplify hands the outputs to Amplify", () => {
    configureAmplify();
    expect(Amplify.configure).toHaveBeenCalled();
  });
});
