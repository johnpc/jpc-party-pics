import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  QueuedUpload,
  addToQueue,
  getAllQueued,
  updateQueueItem,
} from "../helpers/uploadQueue";
import {
  isActive,
  isExhausted,
  isProcessable,
  isRetryable,
  toPending,
} from "../helpers/uploadItemState";
import { cacheFile } from "../helpers/fileCache";
import { processUploadItem } from "./useUploadProcessor";

const MAX_CONCURRENT = 3;

const makeHash = (length: number): string => {
  let result = "";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// @state-machine upload-scheduler
// Which items are in flight is ONE set; the concurrency count is its size.
export function useUploadQueue(albumName: string) {
  const [queue, setQueue] = useState<QueuedUpload[]>([]);
  const hashRef = useRef(makeHash(5));
  // The ONE record of what is running; the concurrency count is its size.
  const inFlightIds = useRef(new Set<string>());
  const queryClient = useQueryClient();

  const refreshQueue = useCallback(async () => {
    const items = await getAllQueued();
    setQueue(items.filter((i) => i.albumName === albumName));
  }, [albumName]);

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  const processNextRef = useRef<() => Promise<void>>();

  const processNext = useCallback(async () => {
    const inFlight = inFlightIds.current;
    if (inFlight.size >= MAX_CONCURRENT) return;

    const items = await getAllQueued();
    const pending = items.filter(
      (i) =>
        i.albumName === albumName && isProcessable(i) && !inFlight.has(i.id),
    );

    for (const item of pending) {
      if (inFlight.size >= MAX_CONCURRENT) break;
      inFlight.add(item.id);
      processUploadItem(item, albumName, hashRef.current, refreshQueue).finally(
        () => {
          inFlight.delete(item.id);
          refreshQueue();
          queryClient.invalidateQueries({ queryKey: ["images", albumName] });
          setTimeout(() => processNextRef.current?.(), 0);
        },
      );
    }
  }, [albumName, queryClient, refreshQueue]);

  processNextRef.current = processNext;

  useEffect(() => {
    const handleOnline = () => {
      processNextRef.current?.();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      for (const file of Array.from(files)) {
        const id = `${Date.now()}-${makeHash(8)}`;
        await addToQueue({
          id,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          albumName,
          status: "pending",
          progress: 0,
          retryCount: 0,
          addedAt: Date.now(),
        });
        await cacheFile(id, file);
      }
      await refreshQueue();
      processNext();
    },
    [albumName, refreshQueue, processNext],
  );

  const retryFailed = useCallback(async () => {
    const items = await getAllQueued();
    const failed = items.filter(
      (i) => i.albumName === albumName && isRetryable(i),
    );
    for (const item of failed) {
      await updateQueueItem(item.id, toPending());
    }
    await refreshQueue();
    processNext();
  }, [albumName, refreshQueue, processNext]);

  const activeCount = queue.filter(isActive).length;

  return {
    queue,
    addFiles,
    retryFailed,
    activeCount,
    retryableCount: queue.filter(isRetryable).length,
    exhaustedCount: queue.filter(isExhausted).length,
    completedCount: queue.filter((i) => i.status === "complete").length,
    isUploading: activeCount > 0,
  };
}
