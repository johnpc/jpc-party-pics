import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { usePhotoGallery } from "./usePhotoGallery";

const mockImages = [
  { key: "photo1.jpg", date: "2024-01-01", size: 1000 },
  { key: "photo2.jpg", date: "2024-06-01", size: 2000 },
  { key: "photo3.jpg", date: "2024-03-01", size: 3000 },
];

const mockDeleteMutateAsync = vi.fn().mockResolvedValue({});
const mockGetUrl = vi.fn().mockResolvedValue({
  url: new URL("https://example.com/file"),
});

vi.mock("aws-amplify/storage", () => ({
  getUrl: (...args: unknown[]) => mockGetUrl(...args),
}));

vi.mock("./useImages", () => ({
  useImages: () => ({
    data: [
      { key: "photo1.jpg", date: "2024-01-01", size: 1000 },
      { key: "photo2.jpg", date: "2024-06-01", size: 2000 },
      { key: "photo3.jpg", date: "2024-03-01", size: 3000 },
    ],
    isLoading: false,
  }),
  useDeleteImage: () => ({
    mutateAsync: mockDeleteMutateAsync,
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("usePhotoGallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    vi.stubGlobal("open", vi.fn());
    vi.stubGlobal("alert", vi.fn());
  });

  it("returns images and loading state", () => {
    const { result } = renderHook(
      () => usePhotoGallery("wedding", "https://example.com/zip"),
      { wrapper: createWrapper() },
    );

    expect(result.current.images).toHaveLength(3);
    expect(result.current.isLoading).toBe(false);
  });

  it("opens and closes modal", () => {
    const { result } = renderHook(
      () => usePhotoGallery("wedding", "https://example.com/zip"),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.handleOpenModal(mockImages[0]);
    });
    expect(result.current.openModalImage).toEqual(mockImages[0]);

    act(() => {
      result.current.handleClose();
    });
    expect(result.current.openModalImage).toBeUndefined();
  });

  it("navigates forward through images", () => {
    const { result } = renderHook(
      () => usePhotoGallery("wedding", "https://example.com/zip"),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.handleOpenModal(mockImages[0]);
    });
    act(() => {
      result.current.handleForwardImage(mockImages[0]);
    });
    expect(result.current.openModalImage?.key).toBe("photo2.jpg");
  });

  it("wraps around when navigating forward past last image", () => {
    const { result } = renderHook(
      () => usePhotoGallery("wedding", "https://example.com/zip"),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.handleForwardImage(mockImages[2]);
    });
    expect(result.current.openModalImage?.key).toBe("photo1.jpg");
  });

  it("navigates backward through images", () => {
    const { result } = renderHook(
      () => usePhotoGallery("wedding", "https://example.com/zip"),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.handleBackImage(mockImages[1]);
    });
    expect(result.current.openModalImage?.key).toBe("photo1.jpg");
  });

  it("wraps around when navigating backward past first image", () => {
    const { result } = renderHook(
      () => usePhotoGallery("wedding", "https://example.com/zip"),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.handleBackImage(mockImages[0]);
    });
    expect(result.current.openModalImage?.key).toBe("photo3.jpg");
  });

  it("deletes file after confirmation", async () => {
    const { result } = renderHook(
      () => usePhotoGallery("wedding", "https://example.com/zip"),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.handleOpenModal(mockImages[0]);
    });

    await act(async () => {
      await result.current.deleteFile("photo1.jpg");
    });

    expect(mockDeleteMutateAsync).toHaveBeenCalledWith("photo1.jpg");
    expect(result.current.openModalImage).toBeUndefined();
  });

  it("does not delete when confirmation is cancelled", async () => {
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(false));

    const { result } = renderHook(
      () => usePhotoGallery("wedding", "https://example.com/zip"),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.deleteFile("photo1.jpg");
    });

    expect(mockDeleteMutateAsync).not.toHaveBeenCalled();
  });

  it("downloads file by opening URL", async () => {
    const mockOpen = vi.fn();
    vi.stubGlobal("open", mockOpen);

    const { result } = renderHook(
      () => usePhotoGallery("wedding", "https://example.com/zip"),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.downloadFile("photo1.jpg");
    });

    expect(mockGetUrl).toHaveBeenCalledWith({
      path: "photo1.jpg",
      options: {
        validateObjectExistence: true,
        expiresIn: 300,
        useAccelerateEndpoint: true,
      },
    });
    expect(mockOpen).toHaveBeenCalled();
  });

  it("downloads all as zip", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ key: "zip-key" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(
      () => usePhotoGallery("wedding", "https://example.com/zip"),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.downloadAll();
    });

    expect(mockFetch).toHaveBeenCalledWith("https://example.com/zip", {
      method: "POST",
      body: JSON.stringify({ albumName: "wedding" }),
    });
  });

  it("does not download all when confirmation is cancelled", async () => {
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(false));
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(
      () => usePhotoGallery("wedding", "https://example.com/zip"),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.downloadAll();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("handles download all error gracefully", async () => {
    const mockAlert = vi.fn();
    vi.stubGlobal("alert", mockAlert);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    const { result } = renderHook(
      () => usePhotoGallery("wedding", "https://example.com/zip"),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.downloadAll();
    });

    expect(mockAlert).toHaveBeenCalledWith(
      "Error downloading zip file: Network error",
    );
    expect(result.current.downloadAllLoading).toBe(false);
  });
});
