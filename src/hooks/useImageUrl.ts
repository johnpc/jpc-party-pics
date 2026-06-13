import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getAccelerateUrl } from "../helpers/getAccelerateUrl";
import { getThumbnailUrl } from "../helpers/getThumbnailUrl";
import { detectFileType } from "../helpers/detectFileType";

const STALE_TIME = 50 * 60 * 1000; // 50 minutes (URLs expire in 60)

async function fetchThumbnailOrFull(key: string): Promise<string> {
  const fileType = detectFileType(key);
  if (fileType === "image") {
    try {
      const thumbUrl = await getThumbnailUrl(key);
      return thumbUrl.toString();
    } catch {
      // Thumbnail not yet generated, fall back to full-size
    }
  }
  const url = await getAccelerateUrl(key);
  return url.toString();
}

async function fetchFullUrl(key: string): Promise<string> {
  const url = await getAccelerateUrl(key);
  return url.toString();
}

export function useImageUrl(
  key: string,
  enabled: boolean,
  variant: "thumbnail" | "full" = "thumbnail",
) {
  const queryFn = variant === "thumbnail" ? fetchThumbnailOrFull : fetchFullUrl;
  const { data } = useQuery({
    queryKey: ["imageUrl", variant, key],
    queryFn: () => queryFn(key),
    enabled,
    staleTime: STALE_TIME,
    gcTime: STALE_TIME,
  });
  return data;
}

export function usePrefetchAdjacentImages(
  keys: string[],
  currentKey: string | undefined,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentKey) return;
    const index = keys.findIndex((k) => k === currentKey);
    if (index === -1) return;

    const prevIndex = index === 0 ? keys.length - 1 : index - 1;
    const nextIndex = index === keys.length - 1 ? 0 : index + 1;
    const adjacentKeys = [keys[prevIndex], keys[nextIndex]];

    for (const key of adjacentKeys) {
      queryClient.prefetchQuery({
        queryKey: ["imageUrl", "full", key],
        queryFn: () => fetchFullUrl(key),
        staleTime: STALE_TIME,
      });
    }
  }, [currentKey, keys, queryClient]);
}
