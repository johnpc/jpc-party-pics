import { ImageRecord } from "../types";
import { FakeState } from "./fakeStore";

// Deterministic demo content. Keys under public/<album>/seed/ are served by
// the dev server's fake-S3 middleware (vite/fakeS3Plugin.ts): a basename that
// exists in e2e/fixtures/ is streamed as-is, anything else becomes a generated
// SVG "photo" so a 30-image album costs nothing to ship.
const BASE_DATE = Date.UTC(2026, 5, 20, 18, 0, 0);

function seedImage(album: string, name: string, index: number): ImageRecord {
  return {
    key: `public/${album}/seed/${name}`,
    size: 180_000 + index * 1_000,
    // Newest first: index 0 is the most recent upload.
    date: new Date(BASE_DATE - index * 60_000).toISOString(),
  };
}

export const DEMO_IMAGE_COUNT = 30;

export function demoImages(): ImageRecord[] {
  return Array.from({ length: DEMO_IMAGE_COUNT }, (_, i) =>
    seedImage("Demo", `demo-${String(i + 1).padStart(2, "0")}.jpg`, i),
  );
}

export function weddingImages(): ImageRecord[] {
  return [
    seedImage("wedding", "test-photo.jpg", 0),
    seedImage("wedding", "tiny.webm", 1),
    ...Array.from({ length: 4 }, (_, i) =>
      seedImage("wedding", `wedding-${i + 1}.jpg`, i + 2),
    ),
  ];
}

export function seedState(): FakeState {
  return {
    albums: [
      { albumName: "Demo" },
      { albumName: "wedding" },
      { albumName: "e2e-test" },
      { albumName: "empty-test-album" },
      { albumName: "my-event" },
    ],
    images: {
      Demo: demoImages(),
      wedding: weddingImages(),
      "e2e-test": [],
      "empty-test-album": [],
      "my-event": Array.from({ length: 2 }, (_, i) =>
        seedImage("my-event", `event-${i + 1}.jpg`, i),
      ),
    },
  };
}
