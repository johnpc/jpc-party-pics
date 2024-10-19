import type { Schema } from "../data/resource";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "$amplify/env/getPartyPicsImages";
import JSZip from "jszip";

const makeHash = (length: number): string => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};
export const handler: Schema["getPartyPicsZipFile"]["functionHandler"] = async (
  input,
) => {
  const bucketName = env.PARTYPICS_BUCKET_NAME;
  const s3 = new S3Client();
  const zip = new JSZip();
  const hash = makeHash(10);
  const listedObjects = await s3.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `public/${input.arguments.albumName}`,
    }),
  );

  // Add each file to the zip
  for (const object of listedObjects.Contents || []) {
    const data = await s3.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: object.Key!,
      }),
    );
    const fileName = object.Key!.split("/").pop();

    zip.file(fileName!, data.Body!.transformToByteArray());
  }

  // Generate the zip file
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  // Upload the zip file to the destination bucket
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: `generated/${hash}.zip`,
      Body: zipBuffer,
    }),
  );

  return {
    size: zipBuffer.length,
    key: `generated/${hash}.zip`,
  };
};
