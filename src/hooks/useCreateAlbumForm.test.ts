import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, ChangeEvent } from "react";
import { useCreateAlbumForm } from "./useCreateAlbumForm";

const mockMutateAsync = vi.fn();

vi.mock("./useAlbums", () => ({
  useAlbums: () => ({ data: [{ albumName: "existing" }] }),
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
});
