import { backend } from "../backend";
import { compressMedia } from "../helpers/compressMedia";
import { detectFileType } from "../helpers/detectFileType";
import {
  ItemPatch,
  toComplete,
  toCompressing,
  toError,
  toRegistering,
  toUploading,
  uploadProgress,
} from "../helpers/uploadItemState";
import {
  QueuedUpload,
  updateQueueItem,
  removeFromQueue,
} from "../helpers/uploadQueue";
import { getFileFromCache } from "../helpers/fileCache";

const MIN_VIDEO_SIZE = 50_000;
const COMPLETE_LINGER_MS = 3000;

function normalizeExtension(fileName: string): string {
  const dotIdx = fileName.lastIndexOf(".");
  if (dotIdx === -1) return fileName;
  return fileName.slice(0, dotIdx) + fileName.slice(dotIdx).toLowerCase();
}

type Refresh = () => Promise<void>;

// The single writer of an upload item's status. Every transition is a patch
// from uploadItemState.ts applied here, then the queue view is refreshed.
async function transition(id: string, patch: ItemPatch, refresh: Refresh) {
  await updateQueueItem(id, patch);
  await refresh();
}

export async function processUploadItem(
  item: QueuedUpload,
  albumName: string,
  hash: string,
  refreshQueue: Refresh,
): Promise<void> {
  try {
    await transition(item.id, toCompressing(), refreshQueue);
    const file = await getFileFromCache(item.id);
    if (!file) {
      const message = "File no longer available. Please re-select.";
      await transition(item.id, toError(item, message), refreshQueue);
      return;
    }

    const normalizedName = normalizeExtension(item.fileName);
    const key = `public/${albumName}/${hash}/${item.id}-${normalizedName}`;
    const compressed = await compressMedia({ file, key });

    if (
      detectFileType(compressed.key) === "video" &&
      compressed.file.size < MIN_VIDEO_SIZE
    ) {
      const message = "Video too short to upload";
      await transition(item.id, toError(item, message), refreshQueue);
      return;
    }

    await transition(item.id, toUploading(), refreshQueue);
    await performUpload(compressed, item.id, refreshQueue);

    await transition(item.id, toRegistering(), refreshQueue);
    await backend.registerImage(albumName, compressed.key);

    await transition(item.id, toComplete(), refreshQueue);
    setTimeout(async () => {
      await removeFromQueue(item.id);
      refreshQueue();
    }, COMPLETE_LINGER_MS);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    await transition(item.id, toError(item, message), refreshQueue);
  }
}

async function performUpload(
  compressed: { file: File; key: string },
  itemId: string,
  refresh: Refresh,
) {
  await backend.upload(compressed.key, compressed.file, {
    onProgress: (transferred, total) => {
      updateQueueItem(itemId, { progress: uploadProgress(transferred, total) });
      refresh();
    },
  });
}
