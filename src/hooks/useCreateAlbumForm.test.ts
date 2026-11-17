import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, ChangeEvent } from "react";
import { useCreateAlbumForm } from "./useCreateAlbumForm";

const mockMutateAsync = vi.fn();
let mockAlbums: { albumName: string }[] = [{ albumName: "existing" }];

vi.mock("./useAlbums", () => ({
  useAlbums: () => ({ data: mockAlbums }),
  useCreateAlbum: () => ({ mutateAsync: mockMutateAsync }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useCreateAlbumForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAlbums = [{ albumName: "existing" }];
    Object.defineProperty(window, "location", {
      value: { href: "/" },
      writable: true,
    });
  });

  it("initializes with empty state", () => {
    const { result } = renderHook(() => useCreateAlbumForm(), {
      wrapper: createWrapper(),
    });

    expect(result.current.createdAlbumName).toBe("");
    expect(result.current.desiredPartyName).toBe("");
    expect(result.current.isValidPartyName).toBe(false);
  });

  it("validates party name without spaces", () => {
    const { result } = renderHook(() => useCreateAlbumForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.onDesiredPartyNameChange({
        target: { value: "my-party" },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.isValidPartyName).toBe(true);
  });

  it("rejects party name with spaces", () => {
    const { result } = renderHook(() => useCreateAlbumForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.onDesiredPartyNameChange({
        target: { value: "my party" },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.isValidPartyName).toBe(false);
  });

  it("rejects duplicate album name (case insensitive)", () => {
    const { result } = renderHook(() => useCreateAlbumForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.onDesiredPartyNameChange({
        target: { value: "Existing" },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.isValidPartyName).toBe(false);
  });

  it("creates album and redirects on success", async () => {
    mockMutateAsync.mockResolvedValue({});

    const { result } = renderHook(() => useCreateAlbumForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.onDesiredPartyNameChange({
        target: { value: "newparty" },
      } as ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.onCreatePartyAlbum();
    });

    expect(mockMutateAsync).toHaveBeenCalledWith("newparty");
    expect(window.location.href).toBe("/newparty");
  });

  it("alerts on invalid name attempt", async () => {
    const mockAlert = vi.fn();
    vi.stubGlobal("alert", mockAlert);

    const { result } = renderHook(() => useCreateAlbumForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.onDesiredPartyNameChange({
        target: { value: "has space" },
      } as ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.onCreatePartyAlbum();
    });

    expect(mockAlert).toHaveBeenCalledWith("Desired party name is not valid");
  });

  it("alerts on creation failure", async () => {
    const mockAlert = vi.fn();
    vi.stubGlobal("alert", mockAlert);
    mockMutateAsync.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCreateAlbumForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.onDesiredPartyNameChange({
        target: { value: "newparty" },
      } as ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.onCreatePartyAlbum();
    });

    expect(mockAlert).toHaveBeenCalledWith(
      "Failed to create album. Try again.",
    );
  });

  it("derives validity from the albums as they load (no stale flag)", () => {
    // The typed name stays the same; only the album list changes.
    mockAlbums = [];
    const { result, rerender } = renderHook(() => useCreateAlbumForm(), {
      wrapper: createWrapper(),
    });
    act(() => {
      result.current.onDesiredPartyNameChange({
        target: { value: "Existing" },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.isValidPartyName).toBe(true);

    mockAlbums = [{ albumName: "existing" }];
    rerender();
    expect(result.current.isValidPartyName).toBe(false);
  });

  it("rejects an empty name", () => {
    const { result } = renderHook(() => useCreateAlbumForm(), {
      wrapper: createWrapper(),
    });
    expect(result.current.isValidPartyName).toBe(false);
  });

  it("ignores a second submit while the first is in flight", async () => {
    let resolveCreate: () => void = () => {};
    mockMutateAsync.mockImplementation(
      () => new Promise<void>((r) => (resolveCreate = r)),
    );
    const { result } = renderHook(() => useCreateAlbumForm(), {
      wrapper: createWrapper(),
    });
    act(() => {
      result.current.onDesiredPartyNameChange({
        target: { value: "newparty" },
      } as ChangeEvent<HTMLInputElement>);
    });

    let first: Promise<void> = Promise.resolve();
    act(() => {
      first = result.current.onCreatePartyAlbum();
    });
    expect(result.current.isSubmitting).toBe(true);
    expect(result.current.submission).toEqual({ kind: "submitting" });
    await act(async () => {
      await result.current.onCreatePartyAlbum();
    });
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveCreate();
      await first;
    });
    expect(result.current.submission).toEqual({
      kind: "created",
      albumName: "newparty",
    });
    expect(result.current.createdAlbumName).toBe("newparty");
  });

  it("a failed submission returns to idle once the name is edited", async () => {
    vi.stubGlobal("alert", vi.fn());
    mockMutateAsync.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useCreateAlbumForm(), {
      wrapper: createWrapper(),
    });
    act(() => {
      result.current.onDesiredPartyNameChange({
        target: { value: "newparty" },
      } as ChangeEvent<HTMLInputElement>);
    });
    await act(async () => {
      await result.current.onCreatePartyAlbum();
    });
    expect(result.current.submission).toEqual({ kind: "failed" });
    act(() => {
      result.current.onDesiredPartyNameChange({
        target: { value: "newparty2" },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.submission).toEqual({ kind: "idle" });
  });
});
