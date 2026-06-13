import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { S3Event } from "aws-lambda";

const s3 = new S3Client();
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".heic", ".gif"];
const VIDEO_EXTENSIONS = [".mp4"];
const THUMBNAIL_WIDTH = 400;
const VIDEO_MAX_DURATION = 15;

export const handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    const ext = key.toLowerCase().substring(key.lastIndexOf("."));
    const isImage = IMAGE_EXTENSIONS.includes(ext);
    const isVideo = VIDEO_EXTENSIONS.includes(ext);
    if (!isImage && !isVideo) return;

    const thumbnailKey = `thumbnails/${key.replace(/^public\//, "")}`;

    mkdirSync("/tmp/thumb", { recursive: true });
    const inputPath = `/tmp/thumb/input${ext}`;

    const obj = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const body = await obj.Body!.transformToByteArray();
    writeFileSync(inputPath, body);

    if (isImage) {
      const outputPath = "/tmp/thumb/output.jpg";
      execSync(
        `/opt/bin/ffmpeg -i ${inputPath} -vf "scale=${THUMBNAIL_WIDTH}:-1" -q:v 3 -y ${outputPath}`,
        { timeout: 30_000 },
      );
      const thumbBuffer = readFileSync(outputPath);
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: thumbnailKey,
          Body: thumbBuffer,
          ContentType: "image/jpeg",
        }),
      );
    } else {
      const outputPath = "/tmp/thumb/output.mp4";
      execSync(
        `/opt/bin/ffmpeg -i ${inputPath} -t ${VIDEO_MAX_DURATION} -vf "scale=${THUMBNAIL_WIDTH}:-2" -c:v libx264 -preset fast -crf 28 -an -movflags +faststart -y ${outputPath}`,
        { timeout: 55_000 },
      );
      const thumbBuffer = readFileSync(outputPath);
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: thumbnailKey,
          Body: thumbBuffer,
          ContentType: "video/mp4",
        }),
      );
    }
  }
};
