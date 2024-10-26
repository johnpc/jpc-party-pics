import * as lambda from "aws-cdk-lib/aws-lambda";
import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";
import { getPartyPicsZipFile } from "./function/resource";

const backend = defineBackend({
  auth,
  data,
  storage,
  getPartyPicsZipFile,
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
