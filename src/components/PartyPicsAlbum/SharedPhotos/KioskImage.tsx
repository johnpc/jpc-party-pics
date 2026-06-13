import { Image, Loader, useTheme } from "@aws-amplify/ui-react";
import { Schema } from "../../../../amplify/data/resource";
import { detectFileType } from "../../../helpers/detectFileType";
import { canPlayVideoFile } from "../../../helpers/videoSupport";
import { VideoFallback } from "./VideoFallback";
import { useImageUrl } from "../../../hooks/useImageUrl";

export const KioskImage = (props: { image: Schema["Image"]["type"] }) => {
  const { tokens } = useTheme();
  const url = useImageUrl(props.image.key, true);

  if (!url) {
    return <Loader size="small" />;
  }

  const fileType = detectFileType(props.image.key);
  const isUnsupportedVideo =
    fileType === "video" && !canPlayVideoFile(props.image.key);

  if (isUnsupportedVideo) {
    return <VideoFallback url={url} style={{ height: "auto" }} />;
  }

  return fileType === "image" ? (
    <Image
      src={url}
      style={{
        borderRadius: tokens.radii.small.value,
        width: "100%",
        height: "auto",
        objectFit: "contain",
      }}
      key={props.image.key}
      alt={props.image.key}
      loading="lazy"
    />
  ) : (
    <video
      style={{
        borderRadius: tokens.radii.small.value,
        width: "100%",
        height: "auto",
        objectFit: "contain",
      }}
      controls={false}
      key={props.image.key}
      preload="metadata"
      playsInline={true}
      autoPlay={true}
      loop={true}
      muted={true}
      src={url}
    />
  );
};
