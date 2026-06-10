import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useAlbums, useCreateAlbum } from "./useAlbums";

const mockList = vi.fn();
const mockCreate = vi.fn();

vi.mock("aws-amplify/api", () => ({
  generateClient: () => ({
    models: {
      Albums: {
        list: (...args: unknown[]) => mockList(...args),
        create: (...args: unknown[]) => mockCreate(...args),
      },
    },
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useAlbums", () => {
  it("fetches albums and returns data", async () => {
    const albums = [{ albumName: "wedding" }, { albumName: "birthday" }];
    mockList.mockResolvedValue({ data: albums });

    const { result } = renderHook(() => useAlbums(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(albums);
  });

  it("returns empty array when data is null", async () => {
    mockList.mockResolvedValue({ data: null });

    const { result } = renderHook(() => useAlbums(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useCreateAlbum", () => {
  it("creates an album and invalidates query", async () => {
    mockCreate.mockResolvedValue({
      data: { albumName: "party" },
      errors: null,
    });

    const { result } = renderHook(() => useCreateAlbum(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync("party");
    expect(mockCreate).toHaveBeenCalledWith({ albumName: "party" });
  });

  it("throws when creation returns errors", async () => {
    mockCreate.mockResolvedValue({
      data: null,
      errors: [{ message: "fail" }],
    });

    const { result } = renderHook(() => useCreateAlbum(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync("bad")).rejects.toThrow(
      "Failed to create album",
    );
  });
});
