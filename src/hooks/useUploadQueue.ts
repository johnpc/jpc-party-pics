import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  QueuedUpload,
  addToQueue,
  getAllQueued,
  updateQueueItem,
} from "../helpers/uploadQueue";
import { cacheFile } from "../helpers/fileCache";
import { processUploadItem } from "./useUploadProcessor";

const MAX_RETRIES = 3;
const MAX_CONCURRENT = 3;

function findProcessable(
  items: QueuedUpload[],
  albumName: string,
  inFlight: Set<string>,
): QueuedUpload[] {
  return items.filter(
    (i) =>
      i.albumName === albumName &&
      (i.status === "pending" || i.status === "error") &&
      i.retryCount < MAX_RETRIES &&
      !inFlight.has(i.id),
  );
}

const makeHash = (length: number): string => {
  let result = "";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function useUploadQueue(albumName: string) {
  const [queue, setQueue] = useState<QueuedUpload[]>([]);
  const activeUploads = useRef(0);
  const hashRef = useRef(makeHash(5));
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
    if (activeUploads.current >= MAX_CONCURRENT) return;

    const items = await getAllQueued();
    const pending = findProcessable(items, albumName, inFlightIds.current);

    for (const item of pending) {
      if (activeUploads.current >= MAX_CONCURRENT) break;
      activeUploads.current++;
      inFlightIds.current.add(item.id);
      processUploadItem(item, albumName, hashRef.current, refreshQueue).finally(
        () => {
          activeUploads.current--;
          inFlightIds.current.delete(item.id);
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
      (i) =>
        i.albumName === albumName &&
        i.status === "error" &&
        i.retryCount < MAX_RETRIES,
    );
    for (const item of failed) {
      await updateQueueItem(item.id, { status: "pending" });
    }
    await refreshQueue();
    processNext();
  }, [albumName, refreshQueue, processNext]);

  const activeCount = queue.filter(
    (i) => i.status !== "complete" && i.status !== "error",
  ).length;

  return {
    queue,
    addFiles,
    retryFailed,
    activeCount,
    errorCount: queue.filter((i) => i.status === "error").length,
    completedCount: queue.filter((i) => i.status === "complete").length,
    isUploading: activeCount > 0,
  };
}
