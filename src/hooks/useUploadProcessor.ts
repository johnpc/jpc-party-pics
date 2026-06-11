import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";
import { compressMedia } from "../helpers/compressMedia";
import {
  QueuedUpload,
  updateQueueItem,
  removeFromQueue,
} from "../helpers/uploadQueue";
import { getFileFromCache } from "../helpers/fileCache";

const client = generateClient<Schema>();

export async function processUploadItem(
  item: QueuedUpload,
  albumName: string,
  hash: string,
  refreshQueue: () => Promise<void>,
): Promise<void> {
  try {
    await markCompressing(item.id, refreshQueue);
    const file = await getFileFromCache(item.id);
    if (!file) {
      await markError(
        item,
        "File no longer available. Please re-select.",
        refreshQueue,
      );
      return;
    }

    const key = `public/${albumName}/${hash}/${item.id}-${item.fileName}`;
    const compressed = await compressMedia({ file, key });

    await markUploading(item.id, refreshQueue);
    await performUpload(compressed, item.id, refreshQueue);

    await markRegistering(item.id, refreshQueue);
    await client.models.AlbumImageKey.create({
      imageKey: compressed.key,
      albumName,
    });

    await markComplete(item.id, refreshQueue);
    setTimeout(() => {
      removeFromQueue(item.id);
      refreshQueue();
    }, 3000);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    await markError(item, message, refreshQueue);
  }
}

async function markCompressing(id: string, refresh: () => Promise<void>) {
  await updateQueueItem(id, { status: "compressing", progress: 0 });
  await refresh();
}

async function markUploading(id: string, refresh: () => Promise<void>) {
  await updateQueueItem(id, { status: "uploading", progress: 10 });
  await refresh();
}

async function markRegistering(id: string, refresh: () => Promise<void>) {
  await updateQueueItem(id, { status: "registering", progress: 95 });
  await refresh();
}

async function markComplete(id: string, refresh: () => Promise<void>) {
  await updateQueueItem(id, { status: "complete", progress: 100 });
  await refresh();
}

async function markError(
  item: QueuedUpload,
  message: string,
  refresh: () => Promise<void>,
) {
  await updateQueueItem(item.id, {
    status: "error",
    error: message,
    retryCount: item.retryCount + 1,
  });
  await refresh();
}

async function performUpload(
  compressed: { file: File; key: string },
  itemId: string,
  refresh: () => Promise<void>,
) {
  await uploadData({
    path: compressed.key,
    data: compressed.file,
    options: {
      useAccelerateEndpoint: true,
      onProgress: (event) => {
        const pct = event.totalBytes
          ? Math.round((event.transferredBytes / event.totalBytes) * 80) + 10
          : 10;
        updateQueueItem(itemId, { progress: pct });
        refresh();
      },
    },
  }).result;
}
