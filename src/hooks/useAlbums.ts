import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { backend } from "../backend";

export const useAlbums = () => {
  return useQuery({
    queryKey: ["albums"],
    queryFn: () => backend.listAlbums(),
  });
};

export const useCreateAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (albumName: string) => backend.createAlbum(albumName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
  });
};
