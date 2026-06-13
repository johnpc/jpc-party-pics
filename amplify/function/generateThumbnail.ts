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
const THUMBNAIL_WIDTH = 400;

export const handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    const ext = key.toLowerCase().substring(key.lastIndexOf("."));
    if (!IMAGE_EXTENSIONS.includes(ext)) return;

    const thumbnailKey = `thumbnails/${key.replace(/^public\//, "")}`;

    mkdirSync("/tmp/thumb", { recursive: true });
    const inputPath = `/tmp/thumb/input${ext}`;
    const outputPath = "/tmp/thumb/output.jpg";

    const obj = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const body = await obj.Body!.transformToByteArray();
    writeFileSync(inputPath, body);

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
  }
};
