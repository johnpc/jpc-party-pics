import { describe, it, expect, beforeEach } from "vitest";
import {
  addToQueue,
  getAllQueued,
  updateQueueItem,
  removeFromQueue,
  clearCompleted,
  QueuedUpload,
} from "./uploadQueue";

const makeItem = (overrides: Partial<QueuedUpload> = {}): QueuedUpload => ({
  id: "test-1",
  fileName: "photo.jpg",
  fileSize: 1024,
  fileType: "image/jpeg",
  albumName: "wedding",
  status: "pending",
  progress: 0,
  retryCount: 0,
  addedAt: Date.now(),
  ...overrides,
});

describe("uploadQueue", () => {
  beforeEach(async () => {
    const items = await getAllQueued();
    for (const item of items) {
      await removeFromQueue(item.id);
    }
  });

  it("adds and retrieves items", async () => {
    const item = makeItem();
    await addToQueue(item);
    const all = await getAllQueued();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe("test-1");
  });

  it("updates an item", async () => {
    await addToQueue(makeItem());
    await updateQueueItem("test-1", { status: "uploading", progress: 50 });
    const all = await getAllQueued();
    expect(all[0].status).toBe("uploading");
    expect(all[0].progress).toBe(50);
  });

  it("removes an item", async () => {
    await addToQueue(makeItem());
    await removeFromQueue("test-1");
    const all = await getAllQueued();
    expect(all).toHaveLength(0);
  });

  it("clears completed items", async () => {
    await addToQueue(makeItem({ id: "done-1", status: "complete" }));
    await addToQueue(makeItem({ id: "pending-1", status: "pending" }));
    await clearCompleted();
    const all = await getAllQueued();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe("pending-1");
  });

  it("handles update for nonexistent item gracefully", async () => {
    await updateQueueItem("nonexistent", { status: "error" });
    const all = await getAllQueued();
    expect(all).toHaveLength(0);
  });
});
