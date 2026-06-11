import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { S3Event } from "aws-lambda";

const s3 = new S3Client();
const NON_MP4_EXTENSIONS = [".webm", ".mkv", ".avi", ".wmv", ".flv"];

export const handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    const ext = key.toLowerCase().substring(key.lastIndexOf("."));
    if (!NON_MP4_EXTENSIONS.includes(ext)) return;

    const mp4Key = key.substring(0, key.lastIndexOf(".")) + ".mp4";

    mkdirSync("/tmp/transcode", { recursive: true });
    const inputPath = `/tmp/transcode/input${ext}`;
    const outputPath = "/tmp/transcode/output.mp4";

    const obj = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const body = await obj.Body!.transformToByteArray();
    writeFileSync(inputPath, body);

    execSync(
      `/opt/bin/ffmpeg -i ${inputPath} -c:v libx264 -preset fast -crf 23 -c:a aac -movflags +faststart -y ${outputPath}`,
      { timeout: 300_000 },
    );

    const mp4Buffer = readFileSync(outputPath);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: mp4Key,
        Body: mp4Buffer,
        ContentType: "video/mp4",
      }),
    );

    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }
};
