import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();
vi.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: class {
      send = mockSend;
    },
    ListObjectsV2Command: class {
      constructor(public input: unknown) {}
    },
    GetObjectCommand: class {
      constructor(public input: unknown) {}
    },
    PutObjectCommand: class {
      constructor(public input: unknown) {}
    },
  };
});

import { handler } from "./getPartyPicsZipFile";

describe("getPartyPicsZipFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("zips album files and uploads the result", async () => {
    mockSend
      .mockResolvedValueOnce({
        Contents: [{ Key: "public/album/photo.jpg" }],
        NextContinuationToken: undefined,
      })
      .mockResolvedValueOnce({
        Body: {
          transformToByteArray: () =>
            Promise.resolve(new Uint8Array([1, 2, 3])),
        },
      })
      .mockResolvedValueOnce({});

    const result = await handler(
      { arguments: { albumName: "album" } } as Parameters<typeof handler>[0],
      {} as Parameters<typeof handler>[1],
    );

    expect(result.size).toBeGreaterThan(0);
    expect(result.key).toMatch(/^generated\/.*\.zip$/);
  });

  it("paginates through all S3 objects", async () => {
    mockSend
      .mockResolvedValueOnce({
        Contents: [{ Key: "public/album/a.jpg" }],
        NextContinuationToken: "token1",
      })
      .mockResolvedValueOnce({
        Contents: [{ Key: "public/album/b.jpg" }],
        NextContinuationToken: undefined,
      })
      .mockResolvedValueOnce({
        Body: {
          transformToByteArray: () =>
            Promise.resolve(new Uint8Array([1, 2, 3])),
        },
      })
      .mockResolvedValueOnce({
        Body: {
          transformToByteArray: () =>
            Promise.resolve(new Uint8Array([4, 5, 6])),
        },
      })
      .mockResolvedValueOnce({});

    const result = await handler(
      { arguments: { albumName: "album" } } as Parameters<typeof handler>[0],
      {} as Parameters<typeof handler>[1],
    );

    expect(result.size).toBeGreaterThan(0);
    expect(mockSend).toHaveBeenCalledTimes(5);
  });

  it("parses albumName from function URL body", async () => {
    mockSend
      .mockResolvedValueOnce({
        Contents: [{ Key: "public/event/pic.jpg" }],
        NextContinuationToken: undefined,
      })
      .mockResolvedValueOnce({
        Body: {
          transformToByteArray: () => Promise.resolve(new Uint8Array([7, 8])),
        },
      })
      .mockResolvedValueOnce({});

    const input = {
      body: JSON.stringify({ albumName: "event" }),
      arguments: { albumName: undefined },
    } as unknown as Parameters<typeof handler>[0];

    const result = await handler(input, {} as Parameters<typeof handler>[1]);

    expect(result.key).toMatch(/^generated\/.*\.zip$/);
  });

  it("handles empty album", async () => {
    mockSend
      .mockResolvedValueOnce({
        Contents: undefined,
        NextContinuationToken: undefined,
      })
      .mockResolvedValueOnce({});

    const result = await handler(
      { arguments: { albumName: "empty" } } as Parameters<typeof handler>[0],
      {} as Parameters<typeof handler>[1],
    );

    expect(result.size).toBeGreaterThan(0);
    expect(result.key).toMatch(/^generated\/.*\.zip$/);
  });
});
