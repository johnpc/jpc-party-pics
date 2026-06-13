const DB_NAME = "partypics-uploads";
const STORE_NAME = "queue";
const DB_VERSION = 1;

export type UploadStatus =
  | "pending"
  | "compressing"
  | "uploading"
  | "registering"
  | "complete"
  | "error";

export interface QueuedUpload {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  albumName: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  retryCount: number;
  addedAt: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllQueued(): Promise<QueuedUpload[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addToQueue(item: QueuedUpload): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateQueueItem(
  id: string,
  updates: Partial<QueuedUpload>,
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      if (getReq.result) {
        store.put({ ...getReq.result, ...updates });
      }
      tx.oncomplete = () => resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function removeFromQueue(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearCompleted(): Promise<void> {
  const all = await getAllQueued();
  const completed = all.filter((item) => item.status === "complete");
  for (const item of completed) {
    await removeFromQueue(item.id);
  }
}
