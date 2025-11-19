import { FileUploader } from "@aws-amplify/ui-react-storage";
import QRCode from "react-qr-code";
import { Divider, Grid, Text, useTheme, View } from "@aws-amplify/ui-react";
import { CopyLink } from "./CopyLink";
import { SharedPhotos } from "./SharedPhotos/SharedPhotos";
import { useState } from "react";
import { useUploadImage } from "../../hooks/useImages";
import { compressMedia } from "../../helpers/compressMedia";

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

const qrSize = 256;

export const PartyPicsAlbum = (props: { albumName: string }) => {
  const { tokens } = useTheme();
  const [hash] = useState(makeHash(5));
  const uploadImage = useUploadImage(props.albumName);

  let path = window.location.pathname;
  if (path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  const onSuccess = async (event: { key?: string | undefined }) => {
    if (event.key) {
      await uploadImage.mutateAsync(event.key);
    }
  };

  return (
    <>
      <Grid
        columnGap="0.5rem"
        rowGap="0.5rem"
        templateColumns="1fr 1fr 1fr"
        templateRows="1fr"
      >
        <View columnStart="1" columnEnd="2">
          <QRCode
            size={qrSize}
            style={{ height: "auto", maxWidth: "100%" }}
            value={window.location.href}
            viewBox={`0 0 ${qrSize} ${qrSize}`}
          />
          <Text fontSize={tokens.fontSizes.small}>
            Share this album link via QR code or copy/paste
          </Text>
        </View>
        <View columnStart="2" columnEnd="-1">
          <FileUploader
            acceptedFileTypes={["image/*", "video/*"]}
            path={`public/${props.albumName}/${hash}`}
            maxFileCount={1000}
            isResumable
            useAccelerateEndpoint
            onUploadSuccess={onSuccess}
            processFile={compressMedia}
          />
        </View>
      </Grid>
      <CopyLink link={window.location.href} />
      <Divider
        marginTop={tokens.space.medium}
        marginBottom={tokens.space.medium}
      />
      <SharedPhotos albumName={props.albumName} />
    </>
  );
};
