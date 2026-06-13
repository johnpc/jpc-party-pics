import { Image, useTheme } from "@aws-amplify/ui-react";
import { Schema } from "../../../../amplify/data/resource";
import { detectFileType } from "../../../helpers/detectFileType";
import { canPlayVideoFile } from "../../../helpers/videoSupport";
import { isMobileScreenSize } from "../../../helpers/isMobileScreenSize";
import { VideoFallback } from "./VideoFallback";
import { useImageUrl } from "../../../hooks/useImageUrl";

const mediaStyle = isMobileScreenSize
  ? { width: "100%", maxHeight: "70vh", objectFit: "contain" as const }
  : {
      width: "80%",
      maxHeight: "50vh",
      objectFit: "contain" as const,
      verticalAlign: "middle" as const,
    };

export const ModalImage = (props: { image: Schema["Image"]["type"] }) => {
  const { tokens } = useTheme();
  const url = useImageUrl(props.image.key, true, "full");

  const fileType = detectFileType(props.image.key);
  const isUnsupportedVideo =
    fileType === "video" && !canPlayVideoFile(props.image.key);

  if (isUnsupportedVideo) {
    return (
      <VideoFallback url={url} style={{ width: "80%", maxHeight: "50vh" }} />
    );
  }

  return fileType === "image" ? (
    <Image
      src={url}
      style={{ borderRadius: tokens.radii.large.value, ...mediaStyle }}
      key={props.image.key}
      alt={props.image.key}
    />
  ) : (
    <video
      style={{ borderRadius: tokens.radii.large.value, ...mediaStyle }}
      controls={true}
      key={props.image.key}
      preload="auto"
      playsInline={true}
      autoPlay={true}
      loop={true}
      muted={true}
      src={url}
    />
  );
};
