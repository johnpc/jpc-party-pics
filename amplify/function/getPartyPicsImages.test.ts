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
  };
});

import { handler } from "./getPartyPicsImages";

describe("getPartyPicsImages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns images from S3", async () => {
    mockSend.mockResolvedValueOnce({
      Contents: [
        {
          Key: "public/wedding/photo1.jpg",
          Size: 1024,
          LastModified: new Date("2024-01-01"),
        },
        {
          Key: "public/wedding/photo2.jpg",
          Size: 2048,
          LastModified: new Date("2024-01-02"),
        },
      ],
      NextContinuationToken: undefined,
    });

    const result = await handler(
      { arguments: { albumName: "wedding" } } as Parameters<typeof handler>[0],
      {} as Parameters<typeof handler>[1],
    );

    expect(result.images).toHaveLength(2);
    expect(result.images[0].key).toBe("public/wedding/photo1.jpg");
    expect(result.images[0].size).toBe(1024);
  });

  it("paginates through multiple pages", async () => {
    mockSend
      .mockResolvedValueOnce({
        Contents: [
          {
            Key: "public/album/a.jpg",
            Size: 100,
            LastModified: new Date(),
          },
        ],
        NextContinuationToken: "token1",
      })
      .mockResolvedValueOnce({
        Contents: [
          {
            Key: "public/album/b.jpg",
            Size: 200,
            LastModified: new Date(),
          },
        ],
        NextContinuationToken: undefined,
      });

    const result = await handler(
      { arguments: { albumName: "album" } } as Parameters<typeof handler>[0],
      {} as Parameters<typeof handler>[1],
    );

    expect(result.images).toHaveLength(2);
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("returns empty array when no contents", async () => {
    mockSend.mockResolvedValueOnce({
      Contents: undefined,
      NextContinuationToken: undefined,
    });

    const result = await handler(
      { arguments: { albumName: "empty" } } as Parameters<typeof handler>[0],
      {} as Parameters<typeof handler>[1],
    );

    expect(result.images).toHaveLength(0);
  });

  it("filters out objects without a Key", async () => {
    mockSend.mockResolvedValueOnce({
      Contents: [
        { Key: "public/album/valid.jpg", Size: 100, LastModified: new Date() },
        { Key: undefined, Size: 50, LastModified: new Date() },
      ],
      NextContinuationToken: undefined,
    });

    const result = await handler(
      { arguments: { albumName: "album" } } as Parameters<typeof handler>[0],
      {} as Parameters<typeof handler>[1],
    );

    expect(result.images).toHaveLength(1);
    expect(result.images[0].key).toBe("public/album/valid.jpg");
  });
});
