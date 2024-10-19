import type { Schema } from "../data/resource";
import { S3Client, ListObjectsCommand } from "@aws-sdk/client-s3";
import { env } from "$amplify/env/getPartyPicsImages";

export const handler: Schema["getPartyPicsImages"]["functionHandler"] = async (
  input,
) => {
  const bucketName = env.PARTYPICS_BUCKET_NAME;
  const s3 = new S3Client();
  const response = await s3.send(
    new ListObjectsCommand({
      Bucket: bucketName,
      Prefix: `public/${input.arguments.albumName}`,
    }),
  );
  const images =
    response.Contents?.filter((t) => t.Key)
      .map((i) => ({
        key: i.Key!,
        size: i.Size!,
      }))
      .filter((t) => t) ?? [];
  return {
    images,
  };
};
