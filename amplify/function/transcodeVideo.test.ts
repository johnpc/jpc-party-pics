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
    DeleteObjectCommand: class {
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
    mockReadFileSync: vi.fn(() => Buffer.from("fake-mp4-data")),
  }),
);
vi.mock("fs", () => ({
  __esModule: true,
  default: {},
  mkdirSync: mockMkdirSync,
  writeFileSync: mockWriteFileSync,
  readFileSync: mockReadFileSync,
}));

import { handler } from "./transcodeVideo";
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

describe("transcodeVideo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({
      Body: { transformToByteArray: () => Promise.resolve(new Uint8Array(10)) },
    });
  });

  it("transcodes .webm to .mp4", async () => {
    await handler(makeS3Event("public/album/video.webm"));

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining("/opt/bin/ffmpeg"),
      expect.objectContaining({ timeout: 300_000 }),
    );
    const putCall = mockSend.mock.calls[1][0];
    expect(putCall.input.Key).toBe("public/album/video.mp4");
    const deleteCall = mockSend.mock.calls[2][0];
    expect(deleteCall.input.Key).toBe("public/album/video.webm");
  });

  it("transcodes .mkv to .mp4", async () => {
    await handler(makeS3Event("public/album/movie.mkv"));

    const putCall = mockSend.mock.calls[1][0];
    expect(putCall.input.Key).toBe("public/album/movie.mp4");
  });

  it("skips non-video extensions", async () => {
    await handler(makeS3Event("public/album/photo.jpg"));

    expect(mockSend).not.toHaveBeenCalled();
  });

  it("decodes URL-encoded keys", async () => {
    await handler(makeS3Event("public/album/my+video.webm"));

    const putCall = mockSend.mock.calls[1][0];
    expect(putCall.input.Key).toBe("public/album/my video.mp4");
  });

  it("handles .mov files", async () => {
    await handler(makeS3Event("public/album/clip.mov"));

    const putCall = mockSend.mock.calls[1][0];
    expect(putCall.input.Key).toBe("public/album/clip.mp4");
  });
});
