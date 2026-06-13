import QRCode from "react-qr-code";
import {
  Button,
  Flex,
  Heading,
  Text,
  useTheme,
  View,
} from "@aws-amplify/ui-react";
import { CopyLink } from "./CopyLink";
import { SharedPhotos } from "./SharedPhotos/SharedPhotos";
import { useState } from "react";
import { useUploadQueue } from "../../hooks/useUploadQueue";
import { UploadProgress } from "./UploadProgress";
import { HeroUploadArea } from "./HeroUploadArea";

export const PartyPicsAlbum = (props: { albumName: string }) => {
  const { tokens } = useTheme();
  const [showShare, setShowShare] = useState(false);
  const uploadQueue = useUploadQueue(props.albumName);

  const albumUrl = window.location.href;
  const kioskUrl = `${window.location.origin}/${props.albumName}/kiosk`;

  return (
    <>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        marginBottom={tokens.space.small}
      >
        <Flex alignItems="baseline" gap={tokens.space.xs}>
          <Text fontSize={tokens.fontSizes.small} color="gray">
            Album:
          </Text>
          <Heading level={4}>{props.albumName}</Heading>
        </Flex>
        <Button
          size="small"
          onClick={() => setShowShare(!showShare)}
          colorTheme={showShare ? "success" : undefined}
        >
          🔗 Share
        </Button>
      </Flex>

      {showShare && <SharePanel albumUrl={albumUrl} kioskUrl={kioskUrl} />}

      <HeroUploadArea
        onFilesSelected={(files) => uploadQueue.addFiles(files)}
        onTapCamera={() =>
          (window.location.href = `/${props.albumName}/camera`)
        }
        isUploading={uploadQueue.isUploading}
        activeCount={uploadQueue.activeCount}
        errorCount={uploadQueue.errorCount}
        onRetry={uploadQueue.retryFailed}
      />

      <UploadProgress queue={uploadQueue.queue} />

      <SharedPhotos albumName={props.albumName} />
    </>
  );
};

function SharePanel(props: { albumUrl: string; kioskUrl: string }) {
  const { tokens } = useTheme();

  return (
    <View
      padding={tokens.space.medium}
      backgroundColor="white"
      borderRadius="large"
      marginBottom={tokens.space.medium}
      textAlign="center"
    >
      <QRCode
        size={200}
        style={{ height: "auto", maxWidth: "100%", margin: "0 auto" }}
        value={props.albumUrl}
        viewBox="0 0 200 200"
      />
      <Flex
        justifyContent="center"
        gap={tokens.space.small}
        marginTop={tokens.space.medium}
        wrap="wrap"
      >
        <CopyLink link={props.albumUrl} />
        <CopyLink
          link={props.kioskUrl}
          label="Copy Kiosk Link"
          variation="link"
        />
      </Flex>
    </View>
  );
}
