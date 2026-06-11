import { FileUploader } from "@aws-amplify/ui-react-storage";
import QRCode from "react-qr-code";
import {
  Button,
  Divider,
  Flex,
  Text,
  useTheme,
  View,
} from "@aws-amplify/ui-react";
import { CopyLink } from "./CopyLink";
import { SharedPhotos } from "./SharedPhotos/SharedPhotos";
import { useState } from "react";
import { useUploadImage } from "../../hooks/useImages";
import { compressMedia } from "../../helpers/compressMedia";
import { isMobileScreenSize } from "../../helpers/isMobileScreenSize";

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

export const PartyPicsAlbum = (props: { albumName: string }) => {
  const { tokens } = useTheme();
  const [hash] = useState(makeHash(5));
  const [showUploader, setShowUploader] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const uploadImage = useUploadImage(props.albumName);

  const onSuccess = async (event: { key?: string | undefined }) => {
    if (event.key) {
      await uploadImage.mutateAsync(event.key);
    }
  };

  const albumUrl = window.location.href;
  const kioskUrl = `${window.location.origin}/${props.albumName}/kiosk`;

  return (
    <>
      <SharedPhotos albumName={props.albumName} />

      {showShare && (
        <View
          padding={tokens.space.medium}
          backgroundColor="white"
          borderRadius="large"
          marginBottom={tokens.space.medium}
        >
          <QRCode
            size={200}
            style={{ height: "auto", maxWidth: "100%", margin: "0 auto" }}
            value={albumUrl}
            viewBox="0 0 200 200"
          />
          <Flex
            justifyContent="center"
            gap={tokens.space.small}
            marginTop={tokens.space.medium}
            wrap="wrap"
          >
            <CopyLink link={albumUrl} />
            <CopyLink
              link={kioskUrl}
              label="Copy Kiosk Link"
              variation="link"
            />
          </Flex>
        </View>
      )}

      {showUploader && (
        <View
          padding={tokens.space.medium}
          backgroundColor="white"
          borderRadius="large"
          marginBottom={tokens.space.medium}
        >
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
      )}

      <Flex
        justifyContent="center"
        gap={tokens.space.small}
        wrap="wrap"
        padding={tokens.space.small}
        style={
          isMobileScreenSize
            ? {
                position: "sticky",
                bottom: 0,
                backgroundColor: "rgba(255,255,255,0.95)",
                borderTop: "1px solid #eee",
                zIndex: 10,
                paddingBottom: "env(safe-area-inset-bottom, 8px)",
              }
            : undefined
        }
      >
        <Button
          variation="primary"
          size={isMobileScreenSize ? "small" : undefined}
          onClick={() => (window.location.href = `/${props.albumName}/camera`)}
        >
          📸 Camera
        </Button>
        <Button
          size={isMobileScreenSize ? "small" : undefined}
          onClick={() => {
            setShowUploader(!showUploader);
            setShowShare(false);
          }}
          colorTheme={showUploader ? "success" : undefined}
        >
          📁 Upload
        </Button>
        <Button
          size={isMobileScreenSize ? "small" : undefined}
          onClick={() => {
            setShowShare(!showShare);
            setShowUploader(false);
          }}
          colorTheme={showShare ? "success" : undefined}
        >
          🔗 Share
        </Button>
      </Flex>

      {!isMobileScreenSize && !showShare && (
        <View marginTop={tokens.space.medium}>
          <Divider marginBottom={tokens.space.medium} />
          <Flex alignItems="center" gap={tokens.space.large}>
            <QRCode
              size={128}
              style={{ height: "auto", minWidth: "128px" }}
              value={albumUrl}
              viewBox="0 0 128 128"
            />
            <Flex direction="column" gap={tokens.space.xs}>
              <Text fontSize={tokens.fontSizes.small}>
                Scan to open on your phone
              </Text>
              <Flex gap={tokens.space.small} wrap="wrap">
                <CopyLink link={albumUrl} />
                <CopyLink
                  link={kioskUrl}
                  label="Copy Kiosk Link"
                  variation="link"
                />
              </Flex>
            </Flex>
          </Flex>
        </View>
      )}
    </>
  );
};
