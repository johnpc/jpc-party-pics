import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { backend } from "../backend";
import { ImageRecord } from "../backend/types";

// @state-machine images-list
// Owned by react-query (loading → list), kept live by the backend's
// create/delete events writing straight into the cache.
export const useImages = (albumName: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["images", albumName],
    queryFn: async () => {
      const images = await backend.listImages(albumName);
      return [...images].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    },
  });

  useEffect(() => {
    const unsubscribeCreate = backend.onImageCreated((event) => {
      if (event.albumName !== albumName) return;
      queryClient.setQueryData<ImageRecord[]>(
        ["images", albumName],
        (old = []) => [
          { size: 0, date: new Date().toISOString(), key: event.imageKey },
          ...old.filter((i) => i.key !== event.imageKey),
        ],
      );
    });

    const unsubscribeDelete = backend.onImageDeleted((event) => {
      queryClient.setQueryData<ImageRecord[]>(
        ["images", albumName],
        (old = []) => old.filter((i) => i.key !== event.imageKey),
      );
    });

    return () => {
      unsubscribeCreate();
      unsubscribeDelete();
    };
  }, [albumName, queryClient]);

  return query;
};

export const useUploadImage = (albumName: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageKey: string) =>
      backend.registerImage(albumName, imageKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images", albumName] });
    },
  });
};

export const useDeleteImage = (albumName: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => backend.deleteImage(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images", albumName] });
    },
  });
};
