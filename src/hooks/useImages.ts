import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";
import { useEffect } from "react";

const client = generateClient<Schema>();

export const useImages = (albumName: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["images", albumName],
    queryFn: async () => {
      const response = await client.queries.getPartyPicsImages({ albumName });
      const images = response.data?.images ?? [];
      images.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      return images;
    },
  });

  useEffect(() => {
    const createListener = client.models.AlbumImageKey.onCreate().subscribe({
      next: (imageKey: Schema["AlbumImageKey"]["type"]) => {
        if (imageKey.albumName === albumName) {
          queryClient.setQueryData<Schema["Image"]["type"][]>(
            ["images", albumName],
            (old = []) => [
              {
                size: 0,
                date: new Date().toLocaleString(),
                key: imageKey.imageKey,
              },
              ...old,
            ],
          );
        }
      },
    });

    const deleteListener = client.models.AlbumImageKey.onDelete().subscribe({
      next: (imageKey: Schema["AlbumImageKey"]["type"]) => {
        queryClient.setQueryData<Schema["Image"]["type"][]>(
          ["images", albumName],
          (old = []) => old.filter((i) => i.key !== imageKey.imageKey),
        );
      },
    });

    return () => {
      createListener.unsubscribe();
      deleteListener.unsubscribe();
    };
  }, [albumName, queryClient]);

  return query;
};

export const useUploadImage = (albumName: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageKey: string) => {
      return await client.models.AlbumImageKey.create({ imageKey, albumName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images", albumName] });
    },
  });
};

export const useDeleteImage = (albumName: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      await client.queries.deletePartyPic({ key });
      await client.models.AlbumImageKey.delete({ imageKey: key });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images", albumName] });
    },
  });
};
