import { FileUploader } from "@aws-amplify/ui-react-storage";

import QRCode from "react-qr-code";
import { Divider, Grid, Text, useTheme, View } from "@aws-amplify/ui-react";
import { CopyLink } from "./CopyLink";
import { SharedPhotos } from "./SharedPhotos";
import { useState } from "react";

const qrSize = 256;
export const PartyPicsAlbum = (props: { albumName: string }) => {
  const { tokens } = useTheme();
  const [lastUploadTime, setLastUploadTime] = useState<Date>(new Date());

  let path = window.location.pathname;
  if (path.endsWith("/")) {
    path = path.slice(0, -1);
  }

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
            Share this album via QR code or copy link
          </Text>
        </View>
        <View columnStart="2" columnEnd="-1">
          <FileUploader
            acceptedFileTypes={["image/*"]}
            path={`public/${props.albumName}`}
            maxFileCount={1000}
            isResumable
            useAccelerateEndpoint
            onUploadSuccess={() => setLastUploadTime(new Date())}
          />
        </View>
      </Grid>
      <CopyLink link={window.location.href} />
      <Divider
        marginTop={tokens.space.medium}
        marginBottom={tokens.space.medium}
      />
      <SharedPhotos
        lastUploadTime={lastUploadTime}
        albumName={props.albumName}
      />
    </>
  );
};
