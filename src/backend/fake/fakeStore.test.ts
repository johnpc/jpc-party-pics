import { describe, it, expect, vi } from "vitest";
import { FAKE_STORE_KEY, FakeStore } from "./fakeStore";

const seed = () => ({
  albums: [{ albumName: "Demo" }],
  images: { Demo: [{ key: "public/Demo/seed/a.jpg", size: 1, date: "d" }] },
});

function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    dump: () => Object.fromEntries(map),
  };
}

describe("FakeStore", () => {
  it("starts from the seed when storage is empty", () => {
    const store = new FakeStore(seed(), memoryStorage());
    expect(store.albums()).toEqual([{ albumName: "Demo" }]);
    expect(store.images("Demo")).toHaveLength(1);
    expect(store.images("nope")).toEqual([]);
  });

  it("restores persisted state over the seed", () => {
    const persisted = {
      albums: [{ albumName: "saved" }],
      images: { saved: [] },
    };
    const storage = memoryStorage({
      [FAKE_STORE_KEY]: JSON.stringify(persisted),
    });
    const store = new FakeStore(seed(), storage);
    expect(store.albums()).toEqual([{ albumName: "saved" }]);
  });

  it("falls back to the seed on corrupt storage and without storage", () => {
    const storage = memoryStorage({ [FAKE_STORE_KEY]: "{not json" });
    expect(new FakeStore(seed(), storage).albums()).toEqual([
      { albumName: "Demo" },
    ]);
    expect(new FakeStore(seed(), null).albums()).toEqual([
      { albumName: "Demo" },
    ]);
  });

  it("persists every write", () => {
    const storage = memoryStorage();
    const store = new FakeStore(seed(), storage);
    store.addAlbum("party");
    expect(JSON.parse(storage.dump()[FAKE_STORE_KEY]).albums).toHaveLength(2);
    store.addImage("party", { key: "public/party/x.jpg", size: 2, date: "d" });
    expect(
      JSON.parse(storage.dump()[FAKE_STORE_KEY]).images.party,
    ).toHaveLength(1);
  });

  it("prepends images (newest first) and notifies creation listeners", () => {
    const store = new FakeStore(seed(), null);
    const listener = vi.fn();
    const unsubscribe = store.onCreated(listener);
    store.addImage("Demo", { key: "public/Demo/new.jpg", size: 2, date: "d" });
    expect(store.images("Demo")[0].key).toBe("public/Demo/new.jpg");
    expect(listener).toHaveBeenCalledWith({
      albumName: "Demo",
      imageKey: "public/Demo/new.jpg",
    });
    unsubscribe();
    store.addImage("Demo", { key: "public/Demo/x.jpg", size: 2, date: "d" });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("removes an image from whichever album holds it and notifies", () => {
    const store = new FakeStore(seed(), null);
    const listener = vi.fn();
    store.onDeleted(listener);
    store.removeImage("public/Demo/seed/a.jpg");
    expect(store.images("Demo")).toEqual([]);
    expect(store.hasKey("public/Demo/seed/a.jpg")).toBe(false);
    expect(listener).toHaveBeenCalledWith({
      albumName: "Demo",
      imageKey: "public/Demo/seed/a.jpg",
    });
    store.removeImage("missing");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("hasKey finds seeded keys", () => {
    const store = new FakeStore(seed(), null);
    expect(store.hasKey("public/Demo/seed/a.jpg")).toBe(true);
    expect(store.hasKey("public/Demo/seed/zzz.jpg")).toBe(false);
  });
});
