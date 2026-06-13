import { defineFunction } from "@aws-amplify/backend";

export const getPartyPicsImages = defineFunction({
  name: "getPartyPicsImages",
  entry: "./getPartyPicsImages.ts",
});

export const getPartyPicsZipFile = defineFunction({
  name: "getPartyPicsZipFile",
  entry: "./getPartyPicsZipFile.ts",
  timeoutSeconds: 600,
  memoryMB: 1024 * 4,
});

export const deletePartyPic = defineFunction({
  name: "deletePartyPic",
  entry: "./deletePartyPic.ts",
});

export const transcodeVideo = defineFunction({
  name: "transcodeVideo",
  entry: "./transcodeVideo.ts",
  timeoutSeconds: 300,
  memoryMB: 1024 * 2,
  resourceGroupName: "storage",
});

export const generateThumbnail = defineFunction({
  name: "generateThumbnail",
  entry: "./generateThumbnail.ts",
  timeoutSeconds: 30,
  memoryMB: 512,
  resourceGroupName: "storage",
});
