import type { Schema } from "../data/resource";
import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "$amplify/env/getPartyPicsImages";

export const handler: Schema["deletePartyPic"]["functionHandler"] = async (
  input,
) => {
  const bucketName = env.PARTYPICS_BUCKET_NAME;
  const s3 = new S3Client();
  const key = input.arguments.key;
  const deletedKey = `deleted/${key.replace(/^public\//, "")}`;

  await s3.send(
    new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${key}`,
      Key: deletedKey,
    }),
  );

  await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));

  const thumbnailKey = `thumbnails/${key.replace(/^public\//, "")}`;
  try {
    await s3.send(
      new DeleteObjectCommand({ Bucket: bucketName, Key: thumbnailKey }),
    );
  } catch {
    // Thumbnail may not exist yet — ignore
  }

  return {
    size: 0,
    date: new Date().toLocaleString(),
    key,
  };
};
