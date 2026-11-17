import { AlbumRecord, ImageEvent, ImageRecord } from "../types";

// In-memory + localStorage-persisted state for the fake backend. Persistence
// is what lets a full-page navigation (window.location.href = ...) still see
// the album a scenario just created. One Playwright context = one clean store.
export const FAKE_STORE_KEY = "partypics-fake-backend";

export interface FakeState {
  albums: AlbumRecord[];
  images: Record<string, ImageRecord[]>;
}

export type Listener = (event: ImageEvent) => void;

export class FakeStore {
  private state: FakeState;
  private created = new Set<Listener>();
  private deleted = new Set<Listener>();

  constructor(
    seed: FakeState,
    private storage: Pick<Storage, "getItem" | "setItem"> | null,
  ) {
    this.state = loadState(storage) ?? seed;
  }

  albums(): AlbumRecord[] {
    return [...this.state.albums];
  }

  addAlbum(albumName: string): void {
    this.state.albums.push({ albumName });
    this.persist();
  }

  images(albumName: string): ImageRecord[] {
    return [...(this.state.images[albumName] ?? [])];
  }

  addImage(albumName: string, record: ImageRecord): void {
    const list = this.state.images[albumName] ?? [];
    this.state.images[albumName] = [record, ...list];
    this.persist();
    this.created.forEach((l) => l({ albumName, imageKey: record.key }));
  }

  removeImage(imageKey: string): void {
    for (const albumName of Object.keys(this.state.images)) {
      const list = this.state.images[albumName];
      if (!list.some((i) => i.key === imageKey)) continue;
      this.state.images[albumName] = list.filter((i) => i.key !== imageKey);
      this.persist();
      this.deleted.forEach((l) => l({ albumName, imageKey }));
    }
  }

  hasKey(key: string): boolean {
    return Object.values(this.state.images).some((list) =>
      list.some((i) => i.key === key),
    );
  }

  onCreated(listener: Listener): () => void {
    this.created.add(listener);
    return () => this.created.delete(listener);
  }

  onDeleted(listener: Listener): () => void {
    this.deleted.add(listener);
    return () => this.deleted.delete(listener);
  }

  private persist(): void {
    this.storage?.setItem(FAKE_STORE_KEY, JSON.stringify(this.state));
  }
}

function loadState(storage: Pick<Storage, "getItem"> | null): FakeState | null {
  const raw = storage?.getItem(FAKE_STORE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FakeState;
  } catch {
    return null;
  }
}
