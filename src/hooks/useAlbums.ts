import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export const useAlbums = () => {
  return useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      const response = await client.models.Albums.list();
      return response.data ?? [];
    },
  });
};

export const useCreateAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (albumName: string) => {
      const result = await client.models.Albums.create({ albumName });
      if (result.errors) throw new Error("Failed to create album");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
  });
};
