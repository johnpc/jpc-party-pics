const FILE_CACHE_NAME = "partypics-file-cache";

export async function cacheFile(id: string, file: File): Promise<void> {
  const cache = await caches.open(FILE_CACHE_NAME);
  const response = new Response(file, {
    headers: { "Content-Type": file.type, "X-File-Name": file.name },
  });
  await cache.put(`/file-cache/${id}`, response);
}

export async function getFileFromCache(id: string): Promise<File | null> {
  const cache = await caches.open(FILE_CACHE_NAME);
  const response = await cache.match(`/file-cache/${id}`);
  if (!response) return null;
  const blob = await response.blob();
  const name = response.headers.get("X-File-Name") ?? "file";
  return new File([blob], name, { type: blob.type });
}
