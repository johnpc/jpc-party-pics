import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import {
  deletePartyPic,
  getPartyPicsImages,
  getPartyPicsZipFile,
} from "../function/resource";

const schema = a.schema({
  Albums: a
    .model({
      albumName: a.string().required(),
    })
    .authorization((allow) => [allow.guest()]),
  AlbumImageKey: a
    .model({
      albumName: a.string().required(),
      imageKey: a.string().required(),
    })
    .identifier(["imageKey"])
    .authorization((allow) => [allow.guest()]),
  ZipFile: a.customType({
    key: a.string().required(),
    size: a.integer().required(),
  }),
  Image: a.customType({
    key: a.string().required(),
    size: a.integer().required(),
    date: a.string().required(),
  }),
  ImageList: a.customType({
    images: a.ref("Image").required().array().required(),
  }),
  getPartyPicsImages: a
    .query()
    .arguments({ albumName: a.string().required() })
    .returns(a.ref("ImageList"))
    .handler(a.handler.function(getPartyPicsImages))
    .authorization((allow) => allow.guest()),
  getPartyPicsZipFile: a
    .query()
    .arguments({ albumName: a.string().required() })
    .returns(a.ref("ZipFile"))
    .handler(a.handler.function(getPartyPicsZipFile))
    .authorization((allow) => allow.guest()),
  deletePartyPic: a
    .query()
    .arguments({ key: a.string().required() })
    .returns(a.ref("Image"))
    .handler(a.handler.function(deletePartyPic))
    .authorization((allow) => allow.guest()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
  },
});
