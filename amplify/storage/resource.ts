import { defineStorage } from "@aws-amplify/backend";
import {
  deletePartyPic,
  getPartyPicsImages,
  getPartyPicsZipFile,
} from "../function/resource";

export const storage = defineStorage({
  name: "partypics",
  access: ({ authenticated, guest, resource }) => ({
    "public/*": [
      authenticated.to(["read", "write"]),
      guest.to(["read", "write"]),
      resource(getPartyPicsImages).to(["read", "write"]),
      resource(getPartyPicsZipFile).to(["read", "write"]),
      resource(deletePartyPic).to(["read", "write", "delete"]),
    ],
    "generated/*": [
      authenticated.to(["read", "write"]),
      guest.to(["read", "write"]),
      resource(getPartyPicsImages).to(["read", "write"]),
      resource(getPartyPicsZipFile).to(["read", "write"]),
      resource(deletePartyPic).to(["read", "write", "delete"]),
    ],
  }),
});
