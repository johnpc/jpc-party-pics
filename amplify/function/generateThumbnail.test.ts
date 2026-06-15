// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));
vi.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: class {
      send = mockSend;
    },
    GetObjectCommand: class {
      constructor(public input: unknown) {}
    },
    PutObjectCommand: class {
      constructor(public input: unknown) {}
    },
  };
});

const { mockExecSync } = vi.hoisted(() => ({ mockExecSync: vi.fn() }));
vi.mock("child_process", () => ({
  __esModule: true,
  default: {},
  execSync: mockExecSync,
}));

const { mockMkdirSync, mockWriteFileSync, mockReadFileSync } = vi.hoisted(
  () => ({
    mockMkdirSync: vi.fn(),
    mockWriteFileSync: vi.fn(),
    mockReadFileSync: vi.fn(() => Buffer.from("fake-thumb")),
  }),
);
vi.mock("fs", () => ({
  __esModule: true,
  default: {},
  mkdirSync: mockMkdirSync,
  writeFileSync: mockWriteFileSync,
  readFileSync: mockReadFileSync,
}));

import { handler } from "./generateThumbnail";
import { S3Event } from "aws-lambda";

function makeS3Event(key: string): S3Event {
  return {
    Records: [
      {
        s3: {
          bucket: { name: "test-bucket" },
          object: { key },
        },
      },
    ],
  } as unknown as S3Event;
}

describe("generateThumbnail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({
      Body: { transformToByteArray: () => Promise.resolve(new Uint8Array(10)) },
    });
  });

  it("generates JPEG thumbnail for images", async () => {
    await handler(makeS3Event("public/wedding/photo.jpg"));

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining("scale=400:-1"),
      expect.objectContaining({ timeout: 30_000 }),
    );
    const putCall = mockSend.mock.calls[1][0];
    expect(putCall.input.Key).toBe("thumbnails/wedding/photo.jpg");
    expect(putCall.input.ContentType).toBe("image/jpeg");
  });

  it("generates mp4 thumbnail for videos", async () => {
    await handler(makeS3Event("public/wedding/video.mp4"));

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining("scale=400:-2"),
      expect.objectContaining({ timeout: 55_000 }),
    );
    const putCall = mockSend.mock.calls[1][0];
    expect(putCall.input.Key).toBe("thumbnails/wedding/video.mp4");
    expect(putCall.input.ContentType).toBe("video/mp4");
  });

  it("caps video thumbnails at 15 seconds", async () => {
    await handler(makeS3Event("public/album/long-video.mp4"));

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining("-t 15"),
      expect.any(Object),
    );
  });

  it("skips unsupported extensions", async () => {
    await handler(makeS3Event("public/album/file.pdf"));

    expect(mockSend).toHaveBeenCalledTimes(0);
  });

  it("handles .png images", async () => {
    await handler(makeS3Event("public/album/screenshot.png"));

    const putCall = mockSend.mock.calls[1][0];
    expect(putCall.input.Key).toBe("thumbnails/album/screenshot.png");
    expect(putCall.input.ContentType).toBe("image/jpeg");
  });

  it("decodes URL-encoded keys", async () => {
    await handler(makeS3Event("public/album/my+photo.jpg"));

    const putCall = mockSend.mock.calls[1][0];
    expect(putCall.input.Key).toBe("thumbnails/album/my photo.jpg");
  });
});
