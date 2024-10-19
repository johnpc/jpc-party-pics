import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";

const backend = defineBackend({
  auth,
  data,
  storage,
});

const { cfnBucket } = backend.storage.resources.cfnResources;

cfnBucket.accelerateConfiguration = {
  accelerationStatus: "Enabled",
};
