import { useQuery } from "@tanstack/react-query";
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
