import type { Schema } from "../data/resource";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "$amplify/env/getPartyPicsImages";

export const handler: Schema["deletePartyPic"]["functionHandler"] = async (
  input,
) => {
  const bucketName = env.PARTYPICS_BUCKET_NAME;
  const s3 = new S3Client();
  const response = await s3.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: input.arguments.key,
    }),
  );

  console.log({ deleteMarker: response.DeleteMarker });

  return {
    size: 0,
    key: input.arguments.key,
  };
};
