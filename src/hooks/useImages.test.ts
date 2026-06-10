import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useImages, useUploadImage, useDeleteImage } from "./useImages";

const mockGetPartyPicsImages = vi.fn();
const mockCreateAlbumImageKey = vi.fn();
const mockDeleteAlbumImageKey = vi.fn();
const mockDeletePartyPic = vi.fn();
const mockOnCreate = vi.fn();
const mockOnDelete = vi.fn();

vi.mock("aws-amplify/api", () => ({
  generateClient: () => ({
    models: {
      AlbumImageKey: {
        create: (...args: unknown[]) => mockCreateAlbumImageKey(...args),
        delete: (...args: unknown[]) => mockDeleteAlbumImageKey(...args),
        onCreate: () => ({
          subscribe: (handlers: { next: (val: unknown) => void }) => {
            mockOnCreate(handlers);
            return { unsubscribe: vi.fn() };
          },
        }),
        onDelete: () => ({
          subscribe: (handlers: { next: (val: unknown) => void }) => {
            mockOnDelete(handlers);
            return { unsubscribe: vi.fn() };
          },
        }),
      },
    },
    queries: {
      getPartyPicsImages: (...args: unknown[]) =>
        mockGetPartyPicsImages(...args),
      deletePartyPic: (...args: unknown[]) => mockDeletePartyPic(...args),
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

describe("useImages", () => {
  it("fetches and sorts images by date descending", async () => {
    const images = [
      { key: "a.jpg", date: "2024-01-01", size: 100 },
      { key: "b.jpg", date: "2024-06-01", size: 200 },
    ];
    mockGetPartyPicsImages.mockResolvedValue({ data: { images } });

    const { result } = renderHook(() => useImages("wedding"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![0].key).toBe("b.jpg");
    expect(result.current.data![1].key).toBe("a.jpg");
  });

  it("returns empty array when images is null", async () => {
    mockGetPartyPicsImages.mockResolvedValue({ data: { images: null } });

    const { result } = renderHook(() => useImages("empty"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("subscribes to onCreate and updates cache", async () => {
    mockGetPartyPicsImages.mockResolvedValue({ data: { images: [] } });

    const { result } = renderHook(() => useImages("wedding"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const onCreateHandler = mockOnCreate.mock.calls[0]?.[0];
    expect(onCreateHandler).toBeDefined();

    if (onCreateHandler?.next) {
      act(() => {
        onCreateHandler.next({ albumName: "wedding", imageKey: "new.jpg" });
      });
    }
  });

  it("subscribes to onDelete and removes from cache", async () => {
    mockGetPartyPicsImages.mockResolvedValue({
      data: { images: [{ key: "photo.jpg", date: "2024-01-01", size: 100 }] },
    });

    const { result } = renderHook(() => useImages("wedding"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const onDeleteHandler = mockOnDelete.mock.calls[0]?.[0];
    expect(onDeleteHandler).toBeDefined();

    if (onDeleteHandler?.next) {
      act(() => {
        onDeleteHandler.next({ imageKey: "photo.jpg" });
      });
    }
  });

  it("ignores onCreate events from other albums", async () => {
    mockGetPartyPicsImages.mockResolvedValue({ data: { images: [] } });

    const { result } = renderHook(() => useImages("wedding"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const onCreateHandler = mockOnCreate.mock.calls[0]?.[0];
    if (onCreateHandler?.next) {
      act(() => {
        onCreateHandler.next({
          albumName: "other-album",
          imageKey: "nope.jpg",
        });
      });
    }

    expect(result.current.data).toEqual([]);
  });
});

describe("useUploadImage", () => {
  it("creates an album image key record", async () => {
    mockCreateAlbumImageKey.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useUploadImage("wedding"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync("public/wedding/hash/photo.jpg");
    });

    expect(mockCreateAlbumImageKey).toHaveBeenCalledWith({
      imageKey: "public/wedding/hash/photo.jpg",
      albumName: "wedding",
    });
  });
});

describe("useDeleteImage", () => {
  it("deletes the image and album key record", async () => {
    mockDeletePartyPic.mockResolvedValue({});
    mockDeleteAlbumImageKey.mockResolvedValue({});

    const { result } = renderHook(() => useDeleteImage("wedding"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync("public/wedding/hash/photo.jpg");
    });

    expect(mockDeletePartyPic).toHaveBeenCalledWith({
      key: "public/wedding/hash/photo.jpg",
    });
    expect(mockDeleteAlbumImageKey).toHaveBeenCalledWith({
      imageKey: "public/wedding/hash/photo.jpg",
    });
  });
});
