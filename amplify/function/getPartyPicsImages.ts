import type { Schema } from "../data/resource";
import {
  S3Client,
  ListObjectsV2Command,
  type _Object,
} from "@aws-sdk/client-s3";
import { env } from "$amplify/env/getPartyPicsImages";

export const handler: Schema["getPartyPicsImages"]["functionHandler"] = async (
  input,
) => {
  const bucketName = env.PARTYPICS_BUCKET_NAME;
  const s3 = new S3Client();
  const prefix = `public/${input.arguments.albumName}`;

  const allObjects: _Object[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );
    if (response.Contents) {
      allObjects.push(...response.Contents);
    }
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  const images = allObjects
    .filter((obj) => obj.Key)
    .map((obj) => ({
      key: obj.Key!,
      size: obj.Size!,
      date: obj.LastModified!.toLocaleString(),
    }));

  return { images };
};
