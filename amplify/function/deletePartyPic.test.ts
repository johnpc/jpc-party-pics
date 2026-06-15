import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();
vi.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: class {
      send = mockSend;
    },
    CopyObjectCommand: class {
      constructor(public input: unknown) {}
    },
    DeleteObjectCommand: class {
      constructor(public input: unknown) {}
    },
  };
});

import { handler } from "./deletePartyPic";

describe("deletePartyPic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({});
  });

  it("copies file to deleted/ prefix before removing", async () => {
    await handler(
      {
        arguments: { key: "public/wedding/photo.jpg" },
      } as Parameters<typeof handler>[0],
      {} as Parameters<typeof handler>[1],
    );

    const copyCall = mockSend.mock.calls[0][0];
    expect(copyCall.input).toEqual({
      Bucket: "test-bucket",
      CopySource: "test-bucket/public/wedding/photo.jpg",
      Key: "deleted/wedding/photo.jpg",
    });

    const deleteCall = mockSend.mock.calls[1][0];
    expect(deleteCall.input).toEqual({
      Bucket: "test-bucket",
      Key: "public/wedding/photo.jpg",
    });
  });

  it("deletes the thumbnail", async () => {
    await handler(
      {
        arguments: { key: "public/wedding/photo.jpg" },
      } as Parameters<typeof handler>[0],
      {} as Parameters<typeof handler>[1],
    );

    const thumbnailDeleteCall = mockSend.mock.calls[2][0];
    expect(thumbnailDeleteCall.input).toEqual({
      Bucket: "test-bucket",
      Key: "thumbnails/wedding/photo.jpg",
    });
  });

  it("succeeds even if thumbnail does not exist", async () => {
    mockSend
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error("NoSuchKey"));

    const result = await handler(
      {
        arguments: { key: "public/album/no-thumb.jpg" },
      } as Parameters<typeof handler>[0],
      {} as Parameters<typeof handler>[1],
    );

    expect(result.key).toBe("public/album/no-thumb.jpg");
    expect(result.size).toBe(0);
  });

  it("returns the deleted key in the response", async () => {
    const result = await handler(
      {
        arguments: { key: "public/event/img.png" },
      } as Parameters<typeof handler>[0],
      {} as Parameters<typeof handler>[1],
    );

    expect(result.key).toBe("public/event/img.png");
    expect(result.size).toBe(0);
    expect(result.date).toBeDefined();
  });
});
