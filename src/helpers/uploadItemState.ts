import { QueuedUpload, UploadStatus } from "./uploadQueue";

// @state-machine upload-item
// pending → compressing → uploading → registering → complete
//    ↑                                                 ↓ (any step throws)
//    └──────────── retry (retryCount < MAX) ←──────── error
// Every status write goes through these patches; readers use the classifiers.
export const MAX_RETRIES = 3;

export type ItemPatch = Partial<QueuedUpload> & { status: UploadStatus };

export const toCompressing = (): ItemPatch => ({
  status: "compressing",
  progress: 0,
});
export const toUploading = (): ItemPatch => ({
  status: "uploading",
  progress: 10,
});
export const toRegistering = (): ItemPatch => ({
  status: "registering",
  progress: 95,
});
export const toComplete = (): ItemPatch => ({
  status: "complete",
  progress: 100,
});
export const toError = (item: QueuedUpload, error: string): ItemPatch => ({
  status: "error",
  error,
  retryCount: item.retryCount + 1,
});
export const toPending = (): ItemPatch => ({ status: "pending" });

/** 10 % … 90 % while bytes move; the rest belongs to compress/register. */
export function uploadProgress(transferred: number, total?: number): number {
  return total ? Math.round((transferred / total) * 80) + 10 : 10;
}

export const isActive = (item: QueuedUpload): boolean =>
  item.status !== "complete" && item.status !== "error";

export const isFailed = (item: QueuedUpload): boolean =>
  item.status === "error";

/** Failed, and the automatic retry budget still has room. */
export const isRetryable = (item: QueuedUpload): boolean =>
  isFailed(item) && item.retryCount < MAX_RETRIES;

/** Failed for good: the only way forward is to re-select the file. */
export const isExhausted = (item: QueuedUpload): boolean =>
  isFailed(item) && item.retryCount >= MAX_RETRIES;

/** Items the scheduler may start: fresh or retryable, not already running. */
export const isProcessable = (item: QueuedUpload): boolean =>
  item.status === "pending" || isRetryable(item);

export function statusLabel(item: QueuedUpload): string {
  const labels: Record<UploadStatus, string> = {
    pending: "Waiting...",
    compressing: "Compressing...",
    uploading: "Uploading...",
    registering: "Finishing...",
    complete: "Done!",
    error: isExhausted(item) ? "Failed (gave up)" : "Failed",
  };
  return labels[item.status];
}
