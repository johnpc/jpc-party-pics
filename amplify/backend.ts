import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3notifications from "aws-cdk-lib/aws-s3-notifications";
import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";
import { getPartyPicsZipFile, transcodeVideo } from "./function/resource";

const backend = defineBackend({
  auth,
  data,
  storage,
  getPartyPicsZipFile,
  transcodeVideo,
});

const { cfnBucket } = backend.storage.resources.cfnResources;

cfnBucket.accelerateConfiguration = {
  accelerationStatus: "Enabled",
};

const underlyingGetZipFileFunction =
  backend.getPartyPicsZipFile.resources.lambda;
const functionUrl = underlyingGetZipFileFunction.addFunctionUrl({
  authType: lambda.FunctionUrlAuthType.NONE,
  cors: {
    allowedOrigins: ["*"],
  },
});

backend.addOutput({
  custom: {
    zipFileEndpoint: functionUrl.url,
  },
});

const transcodeLambda = backend.transcodeVideo.resources
  .lambda as lambda.Function;
transcodeLambda.addLayers(
  lambda.LayerVersion.fromLayerVersionArn(
    transcodeLambda,
    "FfmpegLayer",
    `arn:aws:lambda:${transcodeLambda.stack.region}:${transcodeLambda.stack.account}:layer:ffmpeg:1`,
  ),
);

const s3Bucket = backend.storage.resources.bucket;
s3Bucket.grantReadWrite(transcodeLambda);
s3Bucket.addEventNotification(
  s3.EventType.OBJECT_CREATED,
  new s3notifications.LambdaDestination(transcodeLambda),
  { prefix: "public/", suffix: ".webm" },
);
s3Bucket.addEventNotification(
  s3.EventType.OBJECT_CREATED,
  new s3notifications.LambdaDestination(transcodeLambda),
  { prefix: "public/", suffix: ".mkv" },
);
s3Bucket.addEventNotification(
  s3.EventType.OBJECT_CREATED,
  new s3notifications.LambdaDestination(transcodeLambda),
  { prefix: "public/", suffix: ".avi" },
);
s3Bucket.addEventNotification(
  s3.EventType.OBJECT_CREATED,
  new s3notifications.LambdaDestination(transcodeLambda),
  { prefix: "public/", suffix: ".wmv" },
);
s3Bucket.addEventNotification(
  s3.EventType.OBJECT_CREATED,
  new s3notifications.LambdaDestination(transcodeLambda),
  { prefix: "public/", suffix: ".flv" },
);
